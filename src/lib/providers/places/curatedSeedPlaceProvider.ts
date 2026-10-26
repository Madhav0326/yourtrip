import { PlaceProvider } from '@/lib/providers/types';
import { AttractionOption } from '@/types/explore';
import { ProvenanceValue } from '@/types/trip';

/**
 * CuratedSeedPlaceProvider
 * Secondary fallback providing realistic, verified travel POIs for popular destinations.
 * Carries ESTIMATED provenance. Never fabricates reviews or unsupported live telemetry.
 */

export const CURATED_ATTRACTIONS: AttractionOption[] = [
  // --- GOA ---
  {
    id: 'seed-goa-aguada',
    name: 'Fort Aguada & Lighthouse',
    address: 'Sinquerim, Candolim, Goa 403515',
    lat: 15.4925,
    lng: 73.7735,
    category: 'CULTURE',
    description: 'A 17th-century Portuguese coastal fortification and lighthouse overlooking the Arabian Sea.',
    recommendedDurationMinutes: 90,
    entryFeeEstimated: {
      value: 50,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'ASI standard adult entry fee',
    },
    rating: {
      value: 4.5,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '16:00 - 18:30 (Sunset)',
    crowdTier: 'HIGH',
    whyRecommended: 'Panoramic coastal views and 17th-century Portuguese ramparts.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-goa-chapora',
    name: 'Chapora Fort',
    address: 'Chapora, Vagator, Goa 403509',
    lat: 15.606,
    lng: 73.7389,
    category: 'CULTURE',
    description: 'Prominent red-laterite fort perched above the Chapora River estuary and Vagator coastline.',
    recommendedDurationMinutes: 75,
    entryFeeEstimated: {
      value: 0,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Free public access',
    },
    rating: {
      value: 4.4,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '17:00 - 18:45 (Golden hour)',
    crowdTier: 'MEDIUM',
    whyRecommended: 'Uninterrupted horizon view across Vagator and Morjim beaches.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-goa-anjuna-beach',
    name: 'Anjuna Beach & Flea Market Grounds',
    address: 'Anjuna, North Goa 403509',
    lat: 15.5807,
    lng: 73.7423,
    category: 'BEACH',
    description: 'Curved shoreline with distinctive laterite rock formations, beachside shacks, and vibrant flea market heritage.',
    recommendedDurationMinutes: 120,
    entryFeeEstimated: {
      value: 0,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Free public beach access',
    },
    rating: {
      value: 4.3,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '15:30 - 19:00',
    crowdTier: 'MEDIUM',
    whyRecommended: 'Iconic North Goa coastal ambiance with scenic rock formations.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-goa-basilica-bom-jesus',
    name: 'Basilica of Bom Jesus',
    address: 'Old Goa Rd, Bainguinim, Goa 403402',
    lat: 15.5009,
    lng: 73.9116,
    category: 'CULTURE',
    description: 'UNESCO World Heritage Baroque Catholic basilica holding the mortal remains of St. Francis Xavier.',
    recommendedDurationMinutes: 60,
    entryFeeEstimated: {
      value: 0,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Free church entry; museum gallery ₹10',
    },
    rating: {
      value: 4.7,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '09:00 - 11:30 (Quiet morning)',
    crowdTier: 'HIGH',
    whyRecommended: 'UNESCO World Heritage Baroque landmark with 400+ years of Goan history.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-goa-dudhsagar',
    name: 'Dudhsagar Waterfalls',
    address: 'Sonaulim, Bhagwan Mahaveer Sanctuary, Goa 403410',
    lat: 15.3144,
    lng: 74.3143,
    category: 'NATURE',
    description: 'Four-tiered 310m cascade on the Mandovi River amidst the Western Ghats jungle.',
    recommendedDurationMinutes: 240,
    entryFeeEstimated: {
      value: 100,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Forest department permit + lifejacket',
    },
    rating: {
      value: 4.6,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '08:00 - 13:00 (Early jeep safari slot)',
    crowdTier: 'HIGH',
    whyRecommended: 'One of India’s tallest and most dramatic cascades.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-goa-palolem',
    name: 'Palolem Beach & Monkey Island',
    address: 'Canacona, South Goa 403702',
    lat: 15.0104,
    lng: 74.0232,
    category: 'BEACH',
    description: 'Crescent-shaped white-sand bay enclosed between headlands, famed for calm swimming waters.',
    recommendedDurationMinutes: 150,
    entryFeeEstimated: {
      value: 0,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Free public beach access',
    },
    rating: {
      value: 4.7,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '07:30 - 10:30 or 16:30 - 18:30',
    crowdTier: 'MEDIUM',
    whyRecommended: 'Tranquil crescent bay with gentle tides suited for kayaking and swimming.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },

  // --- JAIPUR ---
  {
    id: 'seed-jaipur-amer-fort',
    name: 'Amer Palace & Fort',
    address: 'Devisinghpura, Amer, Jaipur, Rajasthan 302001',
    lat: 26.9855,
    lng: 75.8513,
    category: 'CULTURE',
    description: 'Majestic 16th-century Rajput citadel constructed from pale yellow and pink sandstone with Sheesh Mahal mirror palace.',
    recommendedDurationMinutes: 150,
    entryFeeEstimated: {
      value: 100,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Standard Indian citizen entry; foreign tourists ₹500',
    },
    rating: {
      value: 4.8,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '08:30 - 11:00 or 18:30 (Night illumination)',
    crowdTier: 'HIGH',
    whyRecommended: 'Masterpiece of Rajput architecture with the world-renowned Sheesh Mahal.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-jaipur-hawa-mahal',
    name: 'Hawa Mahal (Palace of Winds)',
    address: 'Hawa Mahal Rd, Badi Choupad, J.D.A. Market, Jaipur, Rajasthan 302002',
    lat: 26.9239,
    lng: 75.8267,
    category: 'CULTURE',
    description: 'Five-story pink sandstone palace with 953 honeycomb latticework windows (jharokhas) built in 1799.',
    recommendedDurationMinutes: 45,
    entryFeeEstimated: {
      value: 50,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Standard entry ticket',
    },
    rating: {
      value: 4.5,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '09:00 - 10:30 (Morning sunlight highlights facade)',
    crowdTier: 'HIGH',
    whyRecommended: 'Iconic Pink City landmark with intricate Islamic-Rajput lattice architecture.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-jaipur-nahargarh',
    name: 'Nahargarh Fort & Padao Sunset Point',
    address: 'Krishna Nagar, Brahampuri, Jaipur, Rajasthan 302002',
    lat: 26.9374,
    lng: 75.8155,
    category: 'ATTRACTION',
    description: 'Aravalli ridge fortress offering aerial panoramic views across the entire Jaipur urban basin.',
    recommendedDurationMinutes: 90,
    entryFeeEstimated: {
      value: 50,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Monument entry ticket',
    },
    rating: {
      value: 4.6,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '17:00 - 19:00 (Sunset view)',
    crowdTier: 'MEDIUM',
    whyRecommended: 'Best vantage point in Jaipur for watching the sunset over the Pink City.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },

  // --- GENERAL / DELHI / MUMBAI ---
  {
    id: 'seed-delhi-qutub-minar',
    name: 'Qutub Minar Complex',
    address: 'Seth Sarai, Mehrauli, New Delhi 110030',
    lat: 28.5245,
    lng: 77.1855,
    category: 'CULTURE',
    description: 'UNESCO World Heritage 72.5m fluted red-sandstone minaret founded in 1192 surrounded by medieval ruins.',
    recommendedDurationMinutes: 90,
    entryFeeEstimated: {
      value: 40,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'ASI standard adult entry fee',
    },
    rating: {
      value: 4.6,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '15:30 - 18:00',
    crowdTier: 'MEDIUM',
    whyRecommended: 'Ancient architectural marvel with lush landscaped Mughal gardens.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
  {
    id: 'seed-mumbai-marine-drive',
    name: 'Marine Drive Promenade',
    address: 'Netaji Subhash Chandra Bose Road, Mumbai 400020',
    lat: 18.9432,
    lng: 72.823,
    category: 'ATTRACTION',
    description: 'A 3.6-kilometre-long C-shaped boulevard and promenade along the Arabian Sea coast, known as the Queen’s Necklace.',
    recommendedDurationMinutes: 60,
    entryFeeEstimated: {
      value: 0,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Free public boulevard',
    },
    rating: {
      value: 4.8,
      provenance: 'ESTIMATED',
      lastUpdated: '2026-01-01T00:00:00Z',
      note: 'Aggregated regional traveler consensus',
    },
    bestTimeToVisit: '17:30 - 20:00 (Evening sea breeze)',
    crowdTier: 'HIGH',
    whyRecommended: 'Quintessential Mumbai sea view, Art Deco architecture, and sunset breeze.',
    provenance: 'ESTIMATED',
    provenanceNote: 'Curated regional seed catalog',
  },
];

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class CuratedSeedPlaceProvider implements PlaceProvider {
  name = 'CuratedSeedPlaceProvider';

  async searchAttractions(
    lat: number,
    lng: number,
    radiusMeters = 80000,
    query?: string,
    category?: string
  ): Promise<ProvenanceValue<AttractionOption[]>> {
    let results = CURATED_ATTRACTIONS.slice();

    // 1. Filter by proximity if coordinates are non-zero
    if (lat !== 0 || lng !== 0) {
      const nearby = results.filter((item) => {
        const dist = haversineDistanceMeters(lat, lng, item.lat, item.lng);
        return dist <= radiusMeters;
      });

      // If we found nearby places, prioritize them
      if (nearby.length > 0) {
        results = nearby;
      }
    }

    // 2. Filter by search query if provided
    if (query && query.trim().length > 0) {
      const q = query.toLowerCase().trim();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // 3. Filter by category if specified and not 'ALL'
    if (category && category !== 'ALL') {
      const cat = category.toUpperCase();
      results = results.filter((p) => p.category === cat);
    }

    return {
      value: results,
      provenance: 'ESTIMATED',
      lastUpdated: new Date().toISOString(),
      note: 'Curated regional travel seed database (verified destinations)',
    };
  }

  async getPlaceDetails(placeId: string): Promise<ProvenanceValue<AttractionOption>> {
    const found = CURATED_ATTRACTIONS.find((p) => p.id === placeId);
    if (!found) {
      throw new Error(`Place not found in curated seed catalog: ${placeId}`);
    }
    return {
      value: found,
      provenance: 'ESTIMATED',
      lastUpdated: new Date().toISOString(),
      note: 'Curated regional travel seed database',
    };
  }
}
