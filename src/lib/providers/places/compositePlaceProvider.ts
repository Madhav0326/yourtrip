import { PlaceProvider, CacheProvider } from '@/lib/providers/types';
import { AttractionOption } from '@/types/explore';
import { ProvenanceValue } from '@/types/trip';
import { GeoapifyPlaceProvider } from './geoapifyPlaceProvider';
import { CuratedSeedPlaceProvider } from './curatedSeedPlaceProvider';

/**
 * CompositePlaceProvider
 * Orchestrates the mandatory multi-tier fallback chain for place discovery:
 * Cache -> Geoapify (Primary LIVE) -> Curated Seeds (Secondary ESTIMATED) -> UNAVAILABLE.
 *
 * Cache Policy:
 * - Freshness TTL: 7 Days (604,800,000 ms)
 * - Storage Retention: 30 Days (2,592,000,000 ms)
 */

export class CompositePlaceProvider implements PlaceProvider {
  name = 'CompositePlaceProvider';
  private primary: PlaceProvider;
  private fallback: PlaceProvider;
  private cache?: CacheProvider;

  private freshnessTtlMs = 7 * 24 * 60 * 60 * 1000; // 7 days
  private retentionMs = 30 * 24 * 60 * 60 * 1000;   // 30 days

  constructor(
    primary: PlaceProvider = new GeoapifyPlaceProvider(),
    fallback: PlaceProvider = new CuratedSeedPlaceProvider(),
    cache?: CacheProvider
  ) {
    this.primary = primary;
    this.fallback = fallback;
    this.cache = cache;
  }

  private generateCacheKey(
    lat: number,
    lng: number,
    radiusMeters?: number,
    query?: string,
    category?: string
  ): string {
    const q = (query || '').toLowerCase().trim();
    const cat = (category || 'ALL').toUpperCase();
    const r = radiusMeters ? Math.round(radiusMeters / 1000) : 50;
    return `places:${lat.toFixed(2)},${lng.toFixed(2)}:r${r}:q=${q}:c=${cat}`;
  }

  async searchAttractions(
    lat: number,
    lng: number,
    radiusMeters?: number,
    query?: string,
    category?: string
  ): Promise<ProvenanceValue<AttractionOption[]>> {
    const cacheKey = this.generateCacheKey(lat, lng, radiusMeters, query, category);

    // 1. Check Cache
    if (this.cache) {
      const cached = await this.cache.get<AttractionOption[]>(cacheKey);
      if (cached) {
        const isFresh = Date.now() < cached.freshUntil;
        if (isFresh) {
          return {
            value: cached.data,
            provenance: cached.provenance,
            lastUpdated: new Date(cached.cachedAt).toISOString(),
            note: cached.sourceNote
              ? `${cached.sourceNote} (fresh cache)`
              : 'Served from places cache (fresh)',
          };
        }
      }
    }

    // 2. Try Primary Provider (Geoapify Places API v2 - LIVE)
    try {
      const liveResults = await this.primary.searchAttractions(lat, lng, radiusMeters, query, category);
      if (liveResults && liveResults.value && liveResults.value.length > 0) {
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
      console.warn('[Places] Primary provider unavailable or failed, falling back to curated seeds:', primaryErr instanceof Error ? primaryErr.message : primaryErr);
    }

    // 3. Fallback to Secondary Provider (Curated Seed Catalog - ESTIMATED)
    try {
      const fallbackResults = await this.fallback.searchAttractions(lat, lng, radiusMeters, query, category);
      if (fallbackResults && fallbackResults.value && fallbackResults.value.length > 0) {
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
      console.error('[Places] Fallback seed provider failed:', fallbackErr);
    }

    // 4. Stale Cache Fallback if upstream completely failed
    if (this.cache) {
      const staleCached = await this.cache.get<AttractionOption[]>(cacheKey);
      if (staleCached && staleCached.data.length > 0) {
        const ageHours = Math.round((Date.now() - staleCached.cachedAt) / (60 * 60 * 1000));
        return {
          value: staleCached.data,
          provenance: staleCached.provenance,
          lastUpdated: new Date(staleCached.cachedAt).toISOString(),
          note: `Served from cached places (${ageHours}h ago, stale)`,
        };
      }
    }

    // 5. UNAVAILABLE: Graceful empty response with truth in provenance
    return {
      value: [],
      provenance: 'UNAVAILABLE',
      lastUpdated: new Date().toISOString(),
      note: 'No places discovered for the specified destination and criteria',
    };
  }

  async getPlaceDetails(placeId: string): Promise<ProvenanceValue<AttractionOption>> {
    // 1. Try primary if applicable
    try {
      return await this.primary.getPlaceDetails(placeId);
    } catch {
      // 2. Try fallback
      return await this.fallback.getPlaceDetails(placeId);
    }
  }
}
