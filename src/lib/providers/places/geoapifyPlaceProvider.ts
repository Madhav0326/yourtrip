import { PlaceProvider } from '@/lib/providers/types';
import { AttractionOption } from '@/types/explore';
import { ProvenanceValue } from '@/types/trip';

/**
 * GeoapifyPlaceProvider
 * Primary external places provider calling Geoapify Places API v2.
 * Server-side only: uses GEOAPIFY_API_KEY from environment variables.
 * If API key is not present or upstream fails, throws cleanly so CompositePlaceProvider
 * can fall back to CuratedSeedPlaceProvider.
 */

interface GeoapifyFeature {
  type: string;
  properties: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    country?: string;
    categories?: string[];
    details?: string[];
    rating?: number;
    description?: string;
    opening_hours?: string;
  };
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
}

interface GeoapifyPlacesResponse {
  type: string;
  features: GeoapifyFeature[];
}

export class GeoapifyPlaceProvider implements PlaceProvider {
  name = 'GeoapifyPlaceProvider';
  private apiKey?: string;
  private timeoutMs: number;

  constructor(apiKey?: string, timeoutMs = 3500) {
    this.apiKey = apiKey || process.env.GEOAPIFY_API_KEY;
    this.timeoutMs = timeoutMs;
  }

  private mapCategoriesToDomain(categories?: string[]): 'ATTRACTION' | 'BEACH' | 'CULTURE' | 'NATURE' {
    if (!categories || categories.length === 0) return 'ATTRACTION';
    const joined = categories.join(' ').toLowerCase();
    if (joined.includes('beach') || joined.includes('coast')) return 'BEACH';
    if (joined.includes('museum') || joined.includes('heritage') || joined.includes('monument') || joined.includes('castle') || joined.includes('fort') || joined.includes('religion') || joined.includes('temple') || joined.includes('church')) {
      return 'CULTURE';
    }
    if (joined.includes('natural') || joined.includes('park') || joined.includes('waterfall') || joined.includes('forest') || joined.includes('viewpoint')) {
      return 'NATURE';
    }
    return 'ATTRACTION';
  }

  async searchAttractions(
    lat: number,
    lng: number,
    radiusMeters = 20000,
    query?: string,
    category?: string
  ): Promise<ProvenanceValue<AttractionOption[]>> {
    if (!this.apiKey) {
      throw new Error('GEOAPIFY_API_KEY is not configured in environment variables');
    }

    if (lat === 0 && lng === 0) {
      throw new Error('Coordinates (0,0) not supported for radial places lookup');
    }

    let categoriesParam = 'tourism.sights,tourism.attraction,entertainment.culture,natural';
    if (category && category !== 'ALL') {
      const c = category.toUpperCase();
      if (c === 'BEACH') categoriesParam = 'natural.sand,beach';
      else if (c === 'CULTURE') categoriesParam = 'entertainment.culture,building.historic,tourism.sights.place_of_worship';
      else if (c === 'NATURE') categoriesParam = 'natural,leisure.park';
      else if (c === 'ATTRACTION') categoriesParam = 'tourism.sights,tourism.attraction';
    }

    const radius = Math.min(Math.max(radiusMeters, 1000), 50000);
    const filterParam = `circle:${lng},${lat},${radius}`;

    const url = new URL('https://api.geoapify.com/v2/places');
    url.searchParams.set('categories', categoriesParam);
    url.searchParams.set('filter', filterParam);
    url.searchParams.set('limit', '25');
    url.searchParams.set('apiKey', this.apiKey);

    if (query && query.trim().length > 0) {
      url.searchParams.set('name', query.trim());
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      throw new Error(isAbort ? 'Geoapify places API request timed out (3.5s)' : `Network failure connecting to Geoapify: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new Error(`Geoapify places API returned HTTP ${res.status}: ${res.statusText}`);
    }

    const json = (await res.json()) as GeoapifyPlacesResponse;
    const features = json.features || [];

    const normalized: AttractionOption[] = features
      .filter((f) => f.properties.name && f.properties.name.trim().length > 0)
      .map((f, idx) => {
        const domainCat = this.mapCategoriesToDomain(f.properties.categories);
        const name = f.properties.name!;
        const address =
          f.properties.formatted ||
          [f.properties.address_line1, f.properties.city, f.properties.state]
            .filter(Boolean)
            .join(', ') ||
          'Address not specified';

        const placeId = f.properties.place_id || `geo-${lat.toFixed(3)}-${lng.toFixed(3)}-${idx}`;
        const hasRating = typeof f.properties.rating === 'number';

        return {
          id: placeId,
          name,
          address,
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
          category: domainCat,
          description: f.properties.description || `${domainCat.toLowerCase()} point of interest in ${f.properties.city || 'the destination'}`,
          recommendedDurationMinutes: domainCat === 'CULTURE' ? 90 : domainCat === 'NATURE' ? 120 : 60,
          entryFeeEstimated: {
            value: 0,
            provenance: 'UNAVAILABLE',
            lastUpdated: new Date().toISOString(),
            note: 'Ticket pricing not reported by live POI stream',
          },
          rating: hasRating
            ? {
                value: f.properties.rating!,
                provenance: 'LIVE',
                lastUpdated: new Date().toISOString(),
                note: 'Live Geoapify place rating',
              }
            : {
                value: 0,
                provenance: 'UNAVAILABLE',
                lastUpdated: new Date().toISOString(),
                note: 'Rating not available for this venue',
              },
          bestTimeToVisit: undefined,
          crowdTier: undefined,
          whyRecommended: `Registered ${domainCat.toLowerCase()} venue in live regional directory`,
          provenance: 'LIVE',
          provenanceNote: 'Geoapify Places API v2',
        };
      });

    return {
      value: normalized,
      provenance: 'LIVE',
      lastUpdated: new Date().toISOString(),
      note: 'Live Geoapify Places search results',
    };
  }

  async getPlaceDetails(placeId: string): Promise<ProvenanceValue<AttractionOption>> {
    // Geoapify place details endpoint
    if (!this.apiKey) {
      throw new Error('GEOAPIFY_API_KEY is not configured');
    }

    const url = new URL(`https://api.geoapify.com/v2/place-details`);
    url.searchParams.set('id', placeId);
    url.searchParams.set('apiKey', this.apiKey);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res: Response;
    try {
      res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      throw new Error(`Geoapify place details fetch failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      throw new Error(`Geoapify place details returned HTTP ${res.status}`);
    }

    const json = await res.json();
    const feature: GeoapifyFeature = json.features?.[0] || json;

    const domainCat = this.mapCategoriesToDomain(feature.properties?.categories);
    const item: AttractionOption = {
      id: placeId,
      name: feature.properties?.name || 'Place Details',
      address: feature.properties?.formatted || 'Address not specified',
      lat: feature.geometry?.coordinates?.[1] || 0,
      lng: feature.geometry?.coordinates?.[0] || 0,
      category: domainCat,
      description: feature.properties?.description,
      recommendedDurationMinutes: 60,
      entryFeeEstimated: {
        value: 0,
        provenance: 'UNAVAILABLE',
        lastUpdated: new Date().toISOString(),
        note: 'Ticket pricing not reported',
      },
      provenance: 'LIVE',
      provenanceNote: 'Geoapify Place Details',
    };

    return {
      value: item,
      provenance: 'LIVE',
      lastUpdated: new Date().toISOString(),
      note: 'Live Geoapify Place Details',
    };
  }
}
