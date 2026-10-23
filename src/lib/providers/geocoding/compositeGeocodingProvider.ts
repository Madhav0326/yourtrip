import { GeocodingProvider, GeocodingResult, CacheProvider } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';
import { NominatimProvider } from './nominatimProvider';
import { StaticCityRegistry } from './staticCityRegistry';

/**
 * CompositeGeocodingProvider
 * Fallback chain: Cache -> Nominatim (Primary) -> Static Registry (Secondary) -> UNAVAILABLE.
 */
export class CompositeGeocodingProvider implements GeocodingProvider {
  name = 'CompositeGeocodingProvider';
  private primary: GeocodingProvider;
  private fallback: GeocodingProvider;
  private cache?: CacheProvider;

  // Freshness TTL: 30 days, Retention: 90 days
  private freshnessTtlMs = 30 * 24 * 60 * 60 * 1000;
  private retentionMs = 90 * 24 * 60 * 60 * 1000;

  constructor(
    primary: GeocodingProvider = new NominatimProvider(),
    fallback: GeocodingProvider = new StaticCityRegistry(),
    cache?: CacheProvider
  ) {
    this.primary = primary;
    this.fallback = fallback;
    this.cache = cache;
  }

  async searchDestination(query: string): Promise<ProvenanceValue<GeocodingResult[]>> {
    const trimmed = query.toLowerCase().trim();
    if (!trimmed) {
      return { value: [], provenance: 'LIVE', lastUpdated: new Date().toISOString() };
    }

    const cacheKey = `geo:${trimmed}`;

    // 1. Check Cache
    if (this.cache) {
      const cached = await this.cache.get<GeocodingResult[]>(cacheKey);
      if (cached) {
        return {
          value: cached.data,
          provenance: cached.provenance,
          lastUpdated: new Date(cached.cachedAt).toISOString(),
          note: cached.sourceNote || 'Served from geocoding cache',
        };
      }
    }

    // 2. Try Primary Provider (Nominatim LIVE)
    try {
      const liveResults = await this.primary.searchDestination(query);
      if (liveResults.value.length > 0) {
        if (this.cache) {
          await this.cache.set(
            cacheKey,
            liveResults.value,
            this.freshnessTtlMs,
            this.retentionMs,
            liveResults.provenance,
            liveResults.note
          );
        }
        return liveResults;
      }
    } catch (primaryErr) {
      console.warn('[Geocoding] Primary Nominatim provider failed, falling back to static registry:', primaryErr);
    }

    // 3. Fallback to Secondary Provider (Static Registry ESTIMATED)
    try {
      const fallbackResults = await this.fallback.searchDestination(query);
      if (fallbackResults.value.length > 0) {
        if (this.cache) {
          await this.cache.set(
            cacheKey,
            fallbackResults.value,
            this.freshnessTtlMs,
            this.retentionMs,
            fallbackResults.provenance,
            fallbackResults.note
          );
        }
        return fallbackResults;
      }
    } catch (fallbackErr) {
      console.error('[Geocoding] Both primary and fallback geocoders failed:', fallbackErr);
    }

    // 4. Return UNAVAILABLE if nothing resolved
    return {
      value: [],
      provenance: 'UNAVAILABLE',
      lastUpdated: new Date().toISOString(),
      note: 'Location coordinates unavailable',
    };
  }
}
