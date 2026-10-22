import { Trip, DayPlan, ItineraryItem, TripMember, PackingItem, TripStyle } from '@/types/trip';
import { calculateTripDays } from './utils';

export function createDefaultTrip(
  destination: string,
  startDate: string,
  endDate: string,
  travelerCount: number = 4,
  budgetPerPerson: number = 15000,
  styles: TripStyle[] = ['Relaxed', 'Beach', 'Food']
): Trip {
  const tripId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const daysCount = calculateTripDays(startDate, endDate);
  const totalPlannedBudget = travelerCount * budgetPerPerson;

  const defaultMembers: TripMember[] = [
    { id: 'm1', name: 'You (Organizer)', role: 'OWNER' as const, isCurrentUser: true },
    { id: 'm2', name: 'Rahul', role: 'EDITOR' as const },
    { id: 'm3', name: 'Priya', role: 'EDITOR' as const },
    { id: 'm4', name: 'Ananya', role: 'VIEWER' as const },
  ];

  // Determine itinerary items based on destination keywords
  const isGoa = destination.toLowerCase().includes('goa');
  const isJaipur = destination.toLowerCase().includes('jaipur');

  const days: DayPlan[] = [];

  for (let i = 1; i <= daysCount; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (i - 1));
    const dateStr = dayDate.toISOString().split('T')[0];

    const items: ItineraryItem[] = [];

    if (i === 1) {
      // Day 1
      items.push({
        id: `act_${tripId}_1_1`,
        dayId: `day_${tripId}_1`,
        order: 1,
        title: isJaipur ? 'Arrival & Hotel Check-in' : 'Hotel Check-in & Freshen Up',
        category: 'RELAX',
        location: {
          name: isJaipur ? 'Heritage Haveli Stays, Jaipur' : 'Seaside Boutique Resort, Candolim',
          address: isJaipur ? 'MI Road, Jaipur' : 'Candolim Beach Road, North Goa',
          lat: isJaipur ? 26.9124 : 15.518,
          lng: isJaipur ? 75.7873 : 73.763,
          recommendedDurationMinutes: 60,
        },
        timeSlot: {
          plannedStart: '10:00',
          plannedEnd: '11:00',
        },
        durationMinutes: 60,
        recommendedDurationMinutes: 60,
        estimatedCost: { value: 0, provenance: 'USER_ENTERED' },
        whyRecommended: 'Unpack, recharge from transit, and settle in before exploring.',
        status: 'PLANNED',
      });

      items.push({
        id: `act_${tripId}_1_2`,
        dayId: `day_${tripId}_1`,
        order: 2,
        title: isJaipur ? 'Hawa Mahal Palace' : 'Historic Fort Aguada & Lighthouse',
        category: 'ATTRACTION',
        location: {
          name: isJaipur ? 'Hawa Mahal' : 'Fort Aguada',
          address: isJaipur ? 'Badi Choupad, Pink City' : 'Sinquerim, Candolim',
          lat: isJaipur ? 26.9239 : 15.4925,
          lng: isJaipur ? 75.8267 : 73.7736,
          openingHours: '09:00 - 17:30',
          recommendedDurationMinutes: 90,
        },
        timeSlot: {
          plannedStart: '11:30',
          plannedEnd: '13:00',
        },
        durationMinutes: 90,
        recommendedDurationMinutes: 90,
        travelFromPrevious: {
          fromLocation: isJaipur ? 'Heritage Haveli' : 'Candolim Resort',
          toLocation: isJaipur ? 'Hawa Mahal' : 'Fort Aguada',
          mode: 'CAB',
          distanceKm: isJaipur ? 4.2 : 6.5,
          durationMinutes: 20,
          estimatedCost: { value: 250, provenance: 'ESTIMATED' },
          trafficCondition: { value: 'LIGHT', provenance: 'LIVE' },
        },
        weatherForecast: {
          value: { condition: 'Sunny & Pleasant', temperatureC: 29, precipitationProbability: 5 },
          provenance: 'LIVE',
        },
        expectedCrowd: { value: 'MEDIUM', provenance: 'ESTIMATED' },
        estimatedCost: { value: 200, provenance: 'ESTIMATED' },
        whyRecommended: '11:30 AM allows comfortable sightseeing before peak afternoon heat sets in.',
        status: 'PLANNED',
      });

      items.push({
        id: `act_${tripId}_1_3`,
        dayId: `day_${tripId}_1`,
        order: 3,
        title: isJaipur ? 'Traditional Rajasthani Thali Lunch' : 'Coastal Seafood & Goan Curry Lunch',
        category: 'FOOD',
        location: {
          name: isJaipur ? 'Laxmi Mishthan Bhandar (LMB)' : 'Fishermans Wharf / Calamari',
          address: isJaipur ? 'Johari Bazar, Jaipur' : 'Dando Beach, Candolim',
          lat: isJaipur ? 26.9208 : 15.509,
          lng: isJaipur ? 75.8249 : 73.761,
          openingHours: '12:00 - 23:00',
          recommendedDurationMinutes: 75,
        },
        timeSlot: {
          plannedStart: '13:30',
          plannedEnd: '14:45',
        },
        durationMinutes: 75,
        recommendedDurationMinutes: 75,
        travelFromPrevious: {
          fromLocation: isJaipur ? 'Hawa Mahal' : 'Fort Aguada',
          toLocation: isJaipur ? 'LMB Restaurant' : 'Calamari Beach Shack',
          mode: 'CAB',
          distanceKm: isJaipur ? 1.5 : 4.0,
          durationMinutes: 15,
          estimatedCost: { value: 150, provenance: 'ESTIMATED' },
          trafficCondition: { value: 'MODERATE', provenance: 'LIVE' },
        },
        estimatedCost: { value: 650, provenance: 'ESTIMATED' },
        whyRecommended: 'Renowned authentic regional cuisine within 15 minutes of your morning activity.',
        status: 'PLANNED',
      });

      items.push({
        id: `act_${tripId}_1_4`,
        dayId: `day_${tripId}_1`,
        order: 4,
        title: isJaipur ? 'Nahargarh Fort Sunset Viewpoint' : 'Anjuna Beach Sunset & Ocean Breeze',
        category: isJaipur ? 'ATTRACTION' : 'BEACH',
        location: {
          name: isJaipur ? 'Nahargarh Padao Point' : 'Anjuna Beach Clifftop',
          address: isJaipur ? 'Aravalli Hills, Jaipur' : 'Anjuna, North Goa',
          lat: isJaipur ? 26.9372 : 15.5807,
          lng: isJaipur ? 75.8155 : 73.7438,
          openingHours: '06:00 - 21:00',
          recommendedDurationMinutes: 120,
        },
        timeSlot: {
          plannedStart: '16:45',
          plannedEnd: '18:45',
        },
        durationMinutes: 120,
        recommendedDurationMinutes: 120,
        travelFromPrevious: {
          fromLocation: isJaipur ? 'Johari Bazar' : 'Candolim Shack',
          toLocation: isJaipur ? 'Nahargarh Fort' : 'Anjuna Beach',
          mode: 'CAB',
          distanceKm: isJaipur ? 8.2 : 11.0,
          durationMinutes: 30,
          estimatedCost: { value: 400, provenance: 'ESTIMATED' },
          trafficCondition: { value: 'LIGHT', provenance: 'LIVE' },
        },
        weatherForecast: {
          value: { condition: 'Golden Sunset Clear', temperatureC: 27, precipitationProbability: 0 },
          provenance: 'LIVE',
        },
        expectedCrowd: { value: 'HIGH', provenance: 'ESTIMATED' },
        estimatedCost: { value: 100, provenance: 'ESTIMATED' },
        whyRecommended: 'Sunset is at 6:12 PM. Arriving at 4:45 PM secures prime scenic seating.',
        status: 'PLANNED',
      });
    } else {
      // Days 2+
      items.push({
        id: `act_${tripId}_${i}_1`,
        dayId: `day_${tripId}_${i}`,
        order: 1,
        title: isJaipur ? 'Amer Fort Guided Tour' : 'Dudhsagar Waterfalls or Chapora Fort',
        category: 'ATTRACTION',
        location: {
          name: isJaipur ? 'Amer Palace' : 'Chapora Fort & Vagator',
          address: isJaipur ? 'Devisinghpura, Amer' : 'Chapora, Vagator',
          lat: isJaipur ? 26.9855 : 15.6059,
          lng: isJaipur ? 75.8513 : 73.7366,
          openingHours: '09:00 - 18:00',
        },
        timeSlot: {
          plannedStart: '09:30',
          plannedEnd: '12:00',
        },
        durationMinutes: 150,
        recommendedDurationMinutes: 120,
        estimatedCost: { value: 300, provenance: 'ESTIMATED' },
        whyRecommended: 'Morning visits avoid midday heat and heavy tour buses.',
        status: 'PLANNED',
      });

      items.push({
        id: `act_${tripId}_${i}_2`,
        dayId: `day_${tripId}_${i}`,
        order: 2,
        title: isJaipur ? 'City Palace & Jantar Mantar' : 'Curated Beach Cafe & Watersports',
        category: 'CULTURE',
        location: {
          name: isJaipur ? 'City Palace Courtyard' : 'Baga Watersports Hub',
          address: isJaipur ? 'Jalebi Chowk, Jaipur' : 'Baga Beach, Goa',
          lat: isJaipur ? 26.9258 : 15.5553,
          lng: isJaipur ? 75.8236 : 73.7517,
        },
        timeSlot: {
          plannedStart: '13:30',
          plannedEnd: '16:00',
        },
        durationMinutes: 150,
        recommendedDurationMinutes: 120,
        travelFromPrevious: {
          fromLocation: 'Morning Venue',
          toLocation: 'Afternoon Venue',
          mode: 'CAB',
          distanceKm: 7.0,
          durationMinutes: 25,
          estimatedCost: { value: 300, provenance: 'ESTIMATED' },
          trafficCondition: { value: 'LIGHT', provenance: 'LIVE' },
        },
        estimatedCost: { value: 800, provenance: 'ESTIMATED' },
        whyRecommended: 'Ideal for leisurely exploration with shaded corridors and indoor pavilions.',
        status: 'PLANNED',
      });
    }

    days.push({
      id: `day_${tripId}_${i}`,
      tripId,
      dayNumber: i,
      date: dateStr,
      themeTitle: i === 1 ? 'Arrival & Heritage Sunsets' : i === 2 ? 'Iconic Forts & Vibrant Culture' : `Explorer's Day ${i}`,
      items,
      summary: `Day ${i} in ${destination} focusing on balance, scenic routes, and local flavors.`,
    });
  }

  const packingList: PackingItem[] = [
    { id: 'p1', name: 'Comfortable Walking Shoes', category: 'CLOTHING', quantity: 1, packed: true, recommendedReason: 'Essential for fort exploration and cobblestone walkways.' },
    { id: 'p2', name: 'Light Cotton T-Shirts', category: 'CLOTHING', quantity: daysCount + 1, packed: false, recommendedReason: 'Breathable fabric for daytime temperatures around 28-30°C.' },
    { id: 'p3', name: 'Sunscreen (SPF 50+)', category: 'TOILETRIES', quantity: 1, packed: false, recommendedReason: 'High UV index during outdoor afternoon visits.' },
    { id: 'p4', name: 'Sunglasses & Sun Hat', category: 'CLOTHING', quantity: 1, packed: false },
    { id: 'p5', name: 'Power Bank & Charging Cables', category: 'ELECTRONICS', quantity: 1, packed: false, recommendedReason: 'Keeps phones charged for navigation and photo moments.' },
    { id: 'p6', name: 'Government ID Cards', category: 'DOCUMENTS', quantity: travelerCount, packed: false, recommendedReason: 'Mandatory for hotel check-ins and monument tickets.' },
    { id: 'p7', name: 'Quick-dry Swimwear / Shorts', category: 'CLOTHING', quantity: 2, packed: false, recommendedReason: 'Recommended for beachside relaxation.' },
  ];

  return {
    id: tripId,
    title: `${destination} Trip`,
    destination,
    startDate,
    endDate,
    travelerCount,
    budgetPerPerson,
    totalPlannedBudget,
    currency: 'INR',
    styles,
    isGuest: true,
    shareId: Math.random().toString(36).substring(2, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    members: defaultMembers,
    days,
    expenses: [
      {
        id: 'exp_1',
        tripId,
        title: 'Advance Resort Deposit',
        amount: Math.round(totalPlannedBudget * 0.25),
        category: 'STAY',
        paidByMemberId: defaultMembers[0].id,
        splitAmongMemberIds: defaultMembers.map((m) => m.id),
        splitType: 'EQUAL',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'exp_2',
        tripId,
        title: 'Airport Transfer / Cab',
        amount: 1400,
        category: 'TRANSPORT',
        paidByMemberId: defaultMembers[1]?.id || defaultMembers[0].id,
        splitAmongMemberIds: defaultMembers.map((m) => m.id),
        splitType: 'EQUAL',
        createdAt: new Date().toISOString(),
      },
    ],
    packingList,
    exportHistory: [],
  };
}
