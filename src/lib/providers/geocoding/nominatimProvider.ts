import { GeocodingProvider, GeocodingResult } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';

/**
 * Nominatim Geocoding Provider
 * Uses OpenStreetMap Nominatim API.
 * Rate limit: 1 req/sec max (strictly enforced by server rate limiter).
 * Provenance: LIVE.
 */
export class NominatimProvider implements GeocodingProvider {
  name = 'NominatimProvider';
  private timeoutMs: number;

  constructor(timeoutMs = 3500) {
    this.timeoutMs = timeoutMs;
  }

  async searchDestination(query: string): Promise<ProvenanceValue<GeocodingResult[]>> {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        value: [],
        provenance: 'LIVE',
        lastUpdated: new Date().toISOString(),
      };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');
      url.searchParams.set('q', trimmed);
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('limit', '5');

      const res = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'YourTrip-TripOS/2.0 (OpenStreetMap Compliance; contact: trip-support@yourtrip.app)',
        },
      });

      if (!res.ok) {
        throw new Error(`Nominatim upstream error: HTTP ${res.status}`);
      }

      interface NominatimItem {
        display_name?: string;
        lat?: string;
        lon?: string;
        boundingbox?: [string, string, string, string];
        address?: {
          city?: string;
          town?: string;
          state?: string;
          country?: string;
        };
      }

      const rawList: NominatimItem[] = await res.json();
      const results: GeocodingResult[] = rawList.map((item) => {
        const addr = item.address || {};
        const city = addr.city || addr.town || item.display_name?.split(',')[0] || trimmed;
        const bbox: [number, number, number, number] = item.boundingbox
          ? [
              parseFloat(item.boundingbox[0]),
              parseFloat(item.boundingbox[1]),
              parseFloat(item.boundingbox[2]),
              parseFloat(item.boundingbox[3]),
            ]
          : [0, 0, 0, 0];

        return {
          displayName: item.display_name || trimmed,
          city,
          state: addr.state,
          country: addr.country || 'Unknown',
          lat: parseFloat(item.lat || '0'),
          lng: parseFloat(item.lon || '0'),
          boundingBox: bbox,
        };
      });

      return {
        value: results,
        provenance: 'LIVE',
        lastUpdated: new Date().toISOString(),
        note: 'Live geocoded coordinates from OpenStreetMap Nominatim',
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
