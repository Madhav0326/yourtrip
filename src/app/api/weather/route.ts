import { NextRequest, NextResponse } from 'next/server';
import { CompositeWeatherProvider } from '@/lib/providers/weather/compositeWeatherProvider';
import { OpenMeteoProvider } from '@/lib/providers/weather/openMeteoProvider';
import { HistoricalClimateProvider } from '@/lib/providers/weather/historicalClimateProvider';
import { serverMemoryCache } from '@/lib/cache/memoryCache';
import { globalRateLimiter, ROUTE_POLICIES } from '@/lib/rateLimiter';

// Server-side provider instance
const weatherProvider = new CompositeWeatherProvider(
  new OpenMeteoProvider(3500),
  new HistoricalClimateProvider(),
  serverMemoryCache
);

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const date = searchParams.get('date') || undefined;

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { error: 'Missing required query parameters: lat, lng' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates: lat must be between -90 and 90, lng between -180 and 180' },
        { status: 400 }
      );
    }

    // Rate Limiting per IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'anonymous';
    const rateCheck = globalRateLimiter.consume(`wx:${ip}`, ROUTE_POLICIES.weather);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded for weather lookup. Please retry shortly.' },
        {
          status: 429,
          headers: { 'Retry-After': rateCheck.retryAfterSeconds.toString() },
        }
      );
    }

    const result = await weatherProvider.getForecast(lat, lng, date);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=86400',
        'X-Data-Provenance': result.provenance,
      },
    });
  } catch (err: unknown) {
    console.error('Unhandled error in /api/weather:', err);
    return NextResponse.json(
      {
        value: null,
        provenance: 'UNAVAILABLE',
        note: 'Internal server error while resolving weather',
      },
      { status: 500 }
    );
  }
}
