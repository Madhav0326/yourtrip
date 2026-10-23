import { NextRequest, NextResponse } from 'next/server';
import { CompositeGeocodingProvider } from '@/lib/providers/geocoding/compositeGeocodingProvider';
import { NominatimProvider } from '@/lib/providers/geocoding/nominatimProvider';
import { StaticCityRegistry } from '@/lib/providers/geocoding/staticCityRegistry';
import { serverMemoryCache } from '@/lib/cache/memoryCache';
import { globalRateLimiter, ROUTE_POLICIES } from '@/lib/rateLimiter';

// Server-side provider instance
const geocodingProvider = new CompositeGeocodingProvider(
  new NominatimProvider(3500),
  new StaticCityRegistry(),
  serverMemoryCache
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required query parameter: q' },
        { status: 400 }
      );
    }

    const trimmed = query.trim().slice(0, 100); // Prevent excessively long input

    // Rate Limiting per IP (Strict Nominatim 1 req/sec policy)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = globalRateLimiter.consume(`geo:${ip}`, ROUTE_POLICIES.geocoding);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for geocoding lookup. Please retry in 1 second.' },
        {
          status: 429,
          headers: { 'Retry-After': rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    const result = await geocodingProvider.searchDestination(trimmed);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=2592000, stale-while-revalidate=7776000',
        'X-Data-Provenance': result.provenance,
      },
    });
  } catch (err: unknown) {
    console.error('Unhandled error in /api/geocoding:', err);
    return NextResponse.json(
      {
        value: [],
        provenance: 'UNAVAILABLE',
        note: 'Internal server error while resolving destination coordinates',
      },
      { status: 500 }
    );
  }
}
