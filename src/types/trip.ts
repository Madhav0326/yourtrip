/**
 * Domain Models for YourTrip (TripOS)
 * Strictly typed with DataProvenance and Planned vs Actual semantics.
 */

export type DataProvenance =
  | 'LIVE'
  | 'ESTIMATED'
  | 'AI_RECOMMENDED'
  | 'USER_ENTERED'
  | 'UNAVAILABLE';

export interface ProvenanceValue<T> {
  value: T;
  provenance: DataProvenance;
  lastUpdated?: string;
  note?: string;
}

export type ActivityCategory =
  | 'ATTRACTION'
  | 'FOOD'
  | 'BEACH'
  | 'NATURE'
  | 'CULTURE'
  | 'SHOPPING'
  | 'NIGHTLIFE'
  | 'RELAX'
  | 'TRAVEL';

export type ActivityStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'DELAYED'
  | 'SKIPPED'
  | 'REPLACED';

export type TransportMode =
  | 'WALK'
  | 'CAB'
  | 'SCOOTER'
  | 'BUS'
  | 'METRO'
  | 'CAR'
  | 'FERRY';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
  openingHours?: string;
  recommendedDurationMinutes?: number;
}

export interface TravelLeg {
  fromLocation: string;
  toLocation: string;
  mode: TransportMode;
  distanceKm: number;
  durationMinutes: number;
  estimatedCost: ProvenanceValue<number>;
  trafficCondition: ProvenanceValue<'LIGHT' | 'MODERATE' | 'HEAVY'>;
  routeSummary?: string;
}

export interface ItineraryItem {
  id: string;
  dayId: string;
  order: number;
  title: string;
  category: ActivityCategory;
  location: LocationPoint;
  
  // Planned vs Actual timings
  timeSlot: {
    plannedStart: string; // "10:30"
    plannedEnd: string;   // "12:00"
    actualStart?: string; // "11:15"
    actualEnd?: string;   // "12:45"
  };
  durationMinutes: number;
  recommendedDurationMinutes: number;
  
  // Travel leg arriving at this activity
  travelFromPrevious?: TravelLeg;
  
  // Contextual factors
  weatherForecast?: ProvenanceValue<{
    condition: string;
    temperatureC: number;
    precipitationProbability: number;
  }>;
  expectedCrowd?: ProvenanceValue<'LOW' | 'MEDIUM' | 'HIGH'>;
  estimatedCost: ProvenanceValue<number>;
  
  // Transparent Explainability
  whyRecommended?: string;
  notes?: string;
  
  status: ActivityStatus;
}

export interface DayPlan {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string; // "2026-11-15"
  themeTitle: string;
  items: ItineraryItem[];
  summary?: string;
}

export interface TripMember {
  id: string;
  name: string;
  avatar?: string;
  isCurrentUser?: boolean;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  locationSharing?: {
    enabled: boolean;
    expiresAt?: string;
    lastPing?: {
      lat: number;
      lng: number;
      timestamp: string;
    };
  };
}

export type ExpenseCategory =
  | 'STAY'
  | 'FOOD'
  | 'TRANSPORT'
  | 'ACTIVITIES'
  | 'SHOPPING'
  | 'RENTALS'
  | 'OTHER';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByMemberId: string;
  splitAmongMemberIds: string[];
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE';
  createdAt: string;
  activityId?: string;
  notes?: string;
}

export interface PackingItem {
  id: string;
  name: string;
  category: 'CLOTHING' | 'DOCUMENTS' | 'ELECTRONICS' | 'TOILETRIES' | 'MEDICINE' | 'OTHER';
  quantity: number;
  packed: boolean;
  recommendedReason?: string;
}

export interface ExportSnapshot {
  revisionId: string;
  exportedAt: string;
  contentHash: string;
  itemCount: number;
  totalBudgetSnapshot: number;
}

export type TripStyle =
  | 'Relaxed'
  | 'Adventure'
  | 'Food'
  | 'Beach'
  | 'Nature'
  | 'Photography'
  | 'Shopping'
  | 'Nightlife'
  | 'Culture'
  | 'Family'
  | 'Romantic'
  | 'Backpacking'
  | 'Luxury'
  | 'Business'
  | 'Custom';

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string; // ISO date YYYY-MM-DD
  endDate: string;
  travelerCount: number;
  budgetPerPerson: number;
  totalPlannedBudget: number;
  currency: string;
  styles: TripStyle[];
  isGuest: boolean;
  shareId: string;
  createdAt: string;
  updatedAt: string;
  
  members: TripMember[];
  days: DayPlan[];
  expenses: Expense[];
  packingList: PackingItem[];
  exportHistory: ExportSnapshot[];
}

/**
 * Cascade Engine Types
 */
export interface AffectedActivity {
  item: ItineraryItem;
  dayNumber: number;
  originalStart: string;
  originalEnd: string;
  proposedStart: string;
  proposedEnd: string;
  conflictType: 'OVERLAP' | 'CLOSING_HOURS' | 'PAST_SUNSET' | 'EXCESSIVE_FATIGUE';
  description: string;
}

export interface CascadeOption {
  id: 'SHIFT_DOWNSTREAM' | 'SHORTEN_DELAYED' | 'MOVE_TO_NEXT_DAY' | 'SKIP_INTERMEDIATE' | 'MANUAL';
  title: string;
  description: string;
  impactSummary: string;
  confidenceScore: number; // 0-100
  apply: () => void;
}

export interface CascadeConflictReport {
  triggerItemId: string;
  delayMinutes: number;
  affectedCount: number;
  affectedItems: AffectedActivity[];
  options: CascadeOption[];
}
