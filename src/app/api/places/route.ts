import { NextRequest, NextResponse } from 'next/server';
import { CompositePlaceProvider } from '@/lib/providers/places/compositePlaceProvider';
import { GeoapifyPlaceProvider } from '@/lib/providers/places/geoapifyPlaceProvider';
import { CuratedSeedPlaceProvider } from '@/lib/providers/places/curatedSeedPlaceProvider';
import { serverMemoryCache } from '@/lib/cache/memoryCache';
import { globalRateLimiter, ROUTE_POLICIES } from '@/lib/rateLimiter';

// Singleton server-side provider instance
const placeProvider = new CompositePlaceProvider(
  new GeoapifyPlaceProvider(),
  new CuratedSeedPlaceProvider(),
  serverMemoryCache
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const query = searchParams.get('q') || undefined;
    const category = searchParams.get('category') || undefined;
    const radiusStr = searchParams.get('radius');

    const lat = latStr ? parseFloat(latStr) : 0;
    const lng = lngStr ? parseFloat(lngStr) : 0;
    const radius = radiusStr ? parseInt(radiusStr, 10) : 50000;

    // Rate Limiting per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = globalRateLimiter.consume(`places:${ip}`, ROUTE_POLICIES.places);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for places discovery. Please wait before refreshing.' },
        {
          status: 429,
          headers: { 'Retry-After': rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    const result = await placeProvider.searchAttractions(
      isNaN(lat) ? 0 : lat,
      isNaN(lng) ? 0 : lng,
      isNaN(radius) ? 50000 : radius,
      query ? query.slice(0, 100) : undefined,
      category ? category.slice(0, 30) : undefined
    );

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'X-Data-Provenance': result.provenance,
      },
    });
  } catch (err: unknown) {
    console.error('Unhandled error in /api/places:', err);
    return NextResponse.json(
      {
        value: [],
        provenance: 'UNAVAILABLE',
        note: 'Internal server error while resolving place discovery results',
      },
      { status: 500 }
    );
  }
}
