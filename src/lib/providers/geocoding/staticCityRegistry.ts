import { GeocodingProvider, GeocodingResult } from '@/lib/providers/types';
import { ProvenanceValue } from '@/types/trip';

interface StaticCityEntry {
  displayName: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  aliases: string[];
}

const STATIC_REGISTRY: StaticCityEntry[] = [
  {
    displayName: 'Goa, India',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    lat: 15.2993,
    lng: 74.1240,
    aliases: ['goa', 'north goa', 'south goa', 'panaji', 'calangute', 'candolim'],
  },
  {
    displayName: 'Jaipur, Rajasthan, India',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 26.9124,
    lng: 75.7873,
    aliases: ['jaipur', 'pink city', 'rajasthan'],
  },
  {
    displayName: 'Delhi, India',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    lat: 28.6139,
    lng: 77.2090,
    aliases: ['delhi', 'new delhi', 'ncr'],
  },
  {
    displayName: 'Mumbai, Maharashtra, India',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    lat: 19.0760,
    lng: 72.8777,
    aliases: ['mumbai', 'bombay'],
  },
  {
    displayName: 'Udaipur, Rajasthan, India',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    lat: 24.5854,
    lng: 73.7125,
    aliases: ['udaipur', 'lake city'],
  },
  {
    displayName: 'Manali, Himachal Pradesh, India',
    city: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    lat: 32.2432,
    lng: 77.1892,
    aliases: ['manali', 'kullu', 'himachal'],
  },
  {
    displayName: 'Kochi, Kerala, India',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    lat: 9.9312,
    lng: 76.2673,
    aliases: ['kerala', 'kochi', 'cochin', 'munnar', 'alleppey'],
  },
  {
    displayName: 'Agra, Uttar Pradesh, India',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 27.1767,
    lng: 78.0081,
    aliases: ['agra', 'taj mahal'],
  },
  {
    displayName: 'Varanasi, Uttar Pradesh, India',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    lat: 25.3176,
    lng: 82.9739,
    aliases: ['varanasi', 'banaras', 'kashi'],
  },
  {
    displayName: 'Bengaluru, Karnataka, India',
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    lat: 12.9716,
    lng: 77.5946,
    aliases: ['bengaluru', 'bangalore'],
  },
  {
    displayName: 'Tokyo, Japan',
    city: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    aliases: ['tokyo', 'japan'],
  },
  {
    displayName: 'Paris, France',
    city: 'Paris',
    country: 'France',
    lat: 48.8566,
    lng: 2.3522,
    aliases: ['paris', 'france'],
  },
  {
    displayName: 'London, United Kingdom',
    city: 'London',
    country: 'United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    aliases: ['london', 'uk', 'england'],
  },
  {
    displayName: 'Bali, Indonesia',
    city: 'Bali',
    country: 'Indonesia',
    lat: -8.3405,
    lng: 115.0920,
    aliases: ['bali', 'ubud', 'indonesia'],
  },
  {
    displayName: 'New York, NY, USA',
    city: 'New York',
    state: 'New York',
    country: 'United States',
    lat: 40.7128,
    lng: -74.0060,
    aliases: ['new york', 'nyc', 'manhattan'],
  },
];

export class StaticCityRegistry implements GeocodingProvider {
  name = 'StaticCityRegistry';

  async searchDestination(query: string): Promise<ProvenanceValue<GeocodingResult[]>> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { value: [], provenance: 'ESTIMATED', lastUpdated: new Date().toISOString() };
    }

    const matches = STATIC_REGISTRY.filter((city) =>
      city.aliases.some((alias) => alias.includes(q) || q.includes(alias)) ||
      city.displayName.toLowerCase().includes(q)
    );

    const results: GeocodingResult[] = matches.map((m) => ({
      displayName: m.displayName,
      city: m.city,
      state: m.state,
      country: m.country,
      lat: m.lat,
      lng: m.lng,
      boundingBox: [m.lat - 0.2, m.lat + 0.2, m.lng - 0.2, m.lng + 0.2],
    }));

    return {
      value: results,
      provenance: 'ESTIMATED',
      lastUpdated: new Date().toISOString(),
      note: 'Static destination registry (offline-ready fallback)',
    };
  }
}
