import { DataProvenance, ProvenanceValue } from '@/types/trip';
import { 
  AttractionOption, 
  FoodOption, 
  StayOption, 
  RentalOption, 
  TransportOption 
} from '@/types/explore';

/**
 * Cache Abstraction
 * Separates Freshness TTL from Storage Retention.
 */
export interface CacheEntry<T> {
  data: T;
  cachedAt: number;     // Epoch ms
  freshUntil: number;   // Epoch ms (Freshness TTL)
  expiresAt: number;    // Epoch ms (Retention Window)
  provenance: DataProvenance;
  sourceNote?: string;
}

export interface CacheProvider {
  get<T>(key: string): Promise<CacheEntry<T> | null>;
  set<T>(key: string, data: T, freshnessTtlMs: number, retentionMs: number, provenance: DataProvenance, sourceNote?: string): Promise<void>;
  delete(key: string): Promise<void>;
  clearExpired(): Promise<void>;
}

/**
 * Weather Provider Types
 */
export interface WeatherData {
  temperatureC: number;
  apparentTemperatureC: number;
  condition: string;
  weatherCode: number;
  precipitationProbability: number;
  uvIndex: number;
  sunriseTime: string;  // "06:12"
  sunsetTime: string;   // "18:05"
  isHistoricalNorm?: boolean;
  recordedAt: string;   // ISO timestamp
}

export interface WeatherProvider {
  name: string;
  getForecast(lat: number, lng: number, date?: string): Promise<ProvenanceValue<WeatherData>>;
  getSunTimings(lat: number, lng: number, date?: string): Promise<ProvenanceValue<{ sunrise: string; sunset: string }>>;
}

/**
 * Geocoding Provider Types
 */
export interface GeocodingResult {
  displayName: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  boundingBox: [number, number, number, number]; // [south, north, west, east]
}

export interface GeocodingProvider {
  name: string;
  searchDestination(query: string): Promise<ProvenanceValue<GeocodingResult[]>>;
}

/**
 * Place, Food, Stay, Routing, and Rental Provider Interfaces
 * Defined for Phase 2 decoupling; concrete implementations wire in phases 2B-2C.
 */
export interface PlaceProvider {
  name: string;
  searchAttractions(lat: number, lng: number, radiusMeters?: number): Promise<ProvenanceValue<AttractionOption[]>>;
  getPlaceDetails(placeId: string): Promise<ProvenanceValue<AttractionOption>>;
}

export interface FoodProvider {
  name: string;
  searchDining(
    lat: number, 
    lng: number, 
    filters?: { cuisine?: string[]; dietary?: string[]; mealType?: string }
  ): Promise<ProvenanceValue<FoodOption[]>>;
}

export interface StayProvider {
  name: string;
  searchAccommodations(
    lat: number, 
    lng: number, 
    filters?: { budgetTier?: string; propertyType?: string }
  ): Promise<ProvenanceValue<StayOption[]>>;
}

export interface RouteEstimate {
  distanceKm: number;
  durationMinutes: number;
  geometryPolyline?: string;
  routeSummary: string;
  hasLiveTraffic: boolean; // Must be false for OSRM / Heuristics per Guardrail 4!
}

export interface RoutingProvider {
  name: string;
  calculateRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'DRIVE' | 'WALK' | 'CYCLE'
  ): Promise<ProvenanceValue<RouteEstimate>>;
}

export interface RentalProvider {
  name: string;
  getVehicleEstimates(
    destination: string,
    vehicleType: 'SCOOTER' | 'MOTORCYCLE' | 'CAR' | 'BICYCLE'
  ): Promise<ProvenanceValue<RentalOption[]>>;
}

/**
 * Provider Operational Guardrails & Policy Flags
 * Any uncertain quota or licensing detail is flagged VERIFY BEFORE IMPLEMENTATION.
 */
export const PROVIDER_POLICIES = {
  NOMINATIM: {
    maxRequestsPerSecond: 1, // Enforced strictly by Nominatim Usage Policy
    requiresUserAgent: true,
    commercialUse: 'Allowed with ODbL attribution',
    commercialStatus: 'VERIFIED' as const,
  },
  OPEN_METEO: {
    freeAllowancePerDay: 10000,
    commercialUse: 'Free for non-commercial; commercial requires enterprise subscription or self-hosting',
    commercialStatus: 'VERIFY BEFORE IMPLEMENTATION' as const,
  },
  OSRM: {
    demoServerProductionSLA: false, // Demo server has zero SLA, fallback is mandatory
    liveTrafficIncluded: false, // Per Guardrail 4: Must remain ESTIMATED
    commercialStatus: 'VERIFY BEFORE IMPLEMENTATION' as const,
  },
  GEOAPIFY: {
    freeCreditsPerDay: 3000,
    commercialUseOnFreeTier: true,
    commercialStatus: 'VERIFIED' as const,
  },
} as const;
