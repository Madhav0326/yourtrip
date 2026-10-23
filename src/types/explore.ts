import { ProvenanceValue } from './trip';

/**
 * Phase 2 Separated Domain Models for YourTrip (TripOS)
 * Inherits from a shared base (DiscoverablePlace) without monolithic coupling.
 */

export interface DiscoverablePlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: 'ATTRACTION' | 'FOOD' | 'STAY' | 'RENTAL' | 'BEACH' | 'CULTURE' | 'NATURE';
  photos?: string[];
  rating?: number;
  whyRecommended?: string;
  provenance: ProvenanceValue<string>;
}

export interface AttractionOption extends DiscoverablePlace {
  category: 'ATTRACTION' | 'BEACH' | 'CULTURE' | 'NATURE';
  openingHours?: string;
  recommendedDurationMinutes: number;
  entryFeeEstimated: ProvenanceValue<number>;
  bestTimeToVisit?: string;
  crowdTier?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FoodOption extends DiscoverablePlace {
  category: 'FOOD';
  cuisines: string[];
  dietaryFlags: ('VEGETARIAN' | 'VEGAN' | 'HALAL' | 'GLUTEN_FREE' | 'SEAFOOD')[];
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'CAFE' | 'NIGHTLIFE';
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  openingHours?: string;
  localSpecialties?: string[];
  distanceMeters?: number;
}

export interface StayOption extends DiscoverablePlace {
  category: 'STAY';
  accommodationType: 'RESORT' | 'HAVELI' | 'HOTEL' | 'HOSTEL' | 'HOMESTAY' | 'BOUTIQUE';
  nightlyPriceEstimated: ProvenanceValue<number>;
  roomType?: string;
  amenities: string[];
  checkInTime?: string;
  checkOutTime?: string;
  bookingUrlHint?: string;
  availabilityStatus: 'ESTIMATED_AVAILABLE' | 'UNAVAILABLE';
}

export interface RentalOption {
  id: string;
  destination: string;
  vehicleType: 'SCOOTER' | 'MOTORCYCLE' | 'CAR' | 'BICYCLE';
  dailyRateEstimated: ProvenanceValue<number>;
  depositEstimated?: number;
  fuelPolicy: 'FULL_TO_FULL' | 'SELF_REFILL';
  pickupLocationHint?: string;
  requirements?: string[];
  availabilityStatus: 'ESTIMATED' | 'UNAVAILABLE';
}

export interface TransportOption {
  mode: 'WALK' | 'CAB' | 'SCOOTER' | 'BUS' | 'METRO' | 'CAR' | 'FERRY';
  durationMinutes: number;
  distanceKm: number;
  estimatedCost: ProvenanceValue<number>;
  comfortLevel: 'HIGH' | 'MEDIUM' | 'BUDGET';
  trafficCondition: ProvenanceValue<'LIGHT' | 'MODERATE' | 'HEAVY'>;
}
