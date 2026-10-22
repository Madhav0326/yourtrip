import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Trip,
  ItineraryItem,
  DayPlan,
  ActivityStatus,
  Expense,
  CascadeConflictReport,
  ExportSnapshot,
  TripStyle,
} from '@/types/trip';
import { createDefaultTrip } from '@/lib/tripSeed';
import { idbStorage } from '@/lib/idbStorage';
import {
  detectDownstreamConflicts,
  applyShiftDownstream,
  applyShortenDelayed,
} from '@/lib/cascadeEngine';
import { addMinutesToTime } from '@/lib/utils';

interface TripStoreState {
  currentTrip: Trip | null;
  guestTrips: Trip[];
  activeDayIndex: number;
  selectedActivityId: string | null;
  selectedMapPoint: { lat: number; lng: number; title: string; category?: string } | null;
  
  // Real-life cascade state
  activeCascadeReport: CascadeConflictReport | null;
  
  // What-If Sandbox (Immutable Fork)
  isWhatIfMode: boolean;
  whatIfTripFork: Trip | null;

  // Actions
  createNewTrip: (
    destination: string,
    startDate: string,
    endDate: string,
    travelerCount?: number,
    budgetPerPerson?: number,
    styles?: TripStyle[]
  ) => Trip;
  
  loadTripById: (tripId: string) => boolean;
  setActiveDayIndex: (index: number) => void;
  setSelectedActivityId: (id: string | null) => void;
  setSelectedMapPoint: (point: { lat: number; lng: number; title: string; category?: string } | null) => void;
  
  // Activity actions
  setActivityStatus: (activityId: string, status: ActivityStatus) => void;
  
  // Cascade & Real-life delay handling
  triggerDelayCheck: (activityId: string, newStartTime: string) => CascadeConflictReport | null;
  applyCascadeChoice: (
    choiceId: 'SHIFT_DOWNSTREAM' | 'SHORTEN_DELAYED' | 'MOVE_TO_NEXT_DAY' | 'SKIP_INTERMEDIATE' | 'MANUAL',
    options?: { shortenedMinutes?: number; manualStart?: string }
  ) => void;
  dismissCascade: () => void;
  
  // Expense & Packing
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  togglePackingItem: (itemId: string) => void;
  
  // PDF Snapshot
  registerPdfExport: (snapshot: ExportSnapshot) => void;
  
  // What-If Sandbox
  enterWhatIfMode: () => void;
  modifyWhatIfBudget: (newBudget: number) => void;
  applyWhatIfChanges: () => void;
  discardWhatIfChanges: () => void;
}

export const useTripStore = create<TripStoreState>()(
  persist(
    (set, get) => ({
      currentTrip: null,
      guestTrips: [],
      activeDayIndex: 0,
      selectedActivityId: null,
      selectedMapPoint: null,
      activeCascadeReport: null,
      isWhatIfMode: false,
      whatIfTripFork: null,

      createNewTrip: (destination, startDate, endDate, travelerCount = 4, budgetPerPerson = 15000, styles = ['Relaxed', 'Beach']) => {
        const newTrip = createDefaultTrip(
          destination,
          startDate,
          endDate,
          travelerCount,
          budgetPerPerson,
          styles
        );

        set((state) => ({
          currentTrip: newTrip,
          guestTrips: [newTrip, ...state.guestTrips.filter((t) => t.id !== newTrip.id)],
          activeDayIndex: 0,
          selectedActivityId: null,
          selectedMapPoint: newTrip.days[0]?.items[0]
            ? {
                lat: newTrip.days[0].items[0].location.lat,
                lng: newTrip.days[0].items[0].location.lng,
                title: newTrip.days[0].items[0].location.name,
                category: newTrip.days[0].items[0].category,
              }
            : null,
          activeCascadeReport: null,
          isWhatIfMode: false,
          whatIfTripFork: null,
        }));

        return newTrip;
      },

      loadTripById: (tripId: string) => {
        const { currentTrip, guestTrips } = get();
        if (currentTrip && currentTrip.id === tripId) return true;

        const found = guestTrips.find((t) => t.id === tripId);
        if (found) {
          set({
            currentTrip: found,
            activeDayIndex: 0,
            activeCascadeReport: null,
            isWhatIfMode: false,
            whatIfTripFork: null,
          });
          return true;
        }
        return false;
      },

      setActiveDayIndex: (index) => {
        const { currentTrip } = get();
        const safeIndex = Math.max(0, Math.min(index, (currentTrip?.days.length || 1) - 1));
        const day = currentTrip?.days[safeIndex];
        const firstItem = day?.items[0];

        set({
          activeDayIndex: safeIndex,
          selectedActivityId: null,
          selectedMapPoint: firstItem
            ? {
                lat: firstItem.location.lat,
                lng: firstItem.location.lng,
                title: firstItem.location.name,
                category: firstItem.category,
              }
            : null,
        });
      },

      setSelectedActivityId: (id) => {
        const { currentTrip, activeDayIndex } = get();
        if (!id) {
          set({ selectedActivityId: null });
          return;
        }

        const activeDay = currentTrip?.days[activeDayIndex];
        const item = activeDay?.items.find((i) => i.id === id);

        set({
          selectedActivityId: id,
          selectedMapPoint: item
            ? {
                lat: item.location.lat,
                lng: item.location.lng,
                title: item.location.name,
                category: item.category,
              }
            : null,
        });
      },

      setSelectedMapPoint: (point) => {
        set({ selectedMapPoint: point });
      },

      setActivityStatus: (activityId, status) => {
        const { currentTrip, activeDayIndex } = get();
        if (!currentTrip) return;

        const updatedDays = currentTrip.days.map((day, idx) => {
          if (idx !== activeDayIndex) return day;
          return {
            ...day,
            items: day.items.map((item) =>
              item.id === activityId ? { ...item, status } : item
            ),
          };
        });

        const updatedTrip = { ...currentTrip, days: updatedDays, updatedAt: new Date().toISOString() };
        set((state) => ({
          currentTrip: updatedTrip,
          guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
        }));
      },

      triggerDelayCheck: (activityId, newStartTime) => {
        const { currentTrip, activeDayIndex } = get();
        if (!currentTrip) return null;

        const day = currentTrip.days[activeDayIndex];
        if (!day) return null;

        const report = detectDownstreamConflicts(day, activityId, newStartTime);
        set({ activeCascadeReport: report });
        return report;
      },

      applyCascadeChoice: (choiceId, options) => {
        const { currentTrip, activeDayIndex, activeCascadeReport } = get();
        if (!currentTrip || !activeCascadeReport) return;

        const currentDay = currentTrip.days[activeDayIndex];
        const triggerId = activeCascadeReport.triggerItemId;
        let updatedDay: DayPlan = currentDay;

        if (choiceId === 'SHIFT_DOWNSTREAM') {
          const triggerItem = currentDay.items.find((i) => i.id === triggerId);
          if (triggerItem) {
            // Apply shift using the first affected item's delay or simulated time
            const firstAffected = activeCascadeReport.affectedItems[0];
            const newStart = firstAffected ? firstAffected.originalStart : triggerItem.timeSlot.plannedStart;
            updatedDay = applyShiftDownstream(currentDay, triggerId, addMinutesToTime(triggerItem.timeSlot.plannedStart, activeCascadeReport.delayMinutes || 45));
          }
        } else if (choiceId === 'SHORTEN_DELAYED') {
          const shortened = options?.shortenedMinutes || 45;
          const triggerItem = currentDay.items.find((i) => i.id === triggerId);
          if (triggerItem) {
            updatedDay = applyShortenDelayed(currentDay, triggerId, triggerItem.timeSlot.plannedStart, shortened);
          }
        } else if (choiceId === 'SKIP_INTERMEDIATE') {
          const firstAffected = activeCascadeReport.affectedItems[0];
          if (firstAffected) {
            updatedDay = {
              ...currentDay,
              items: currentDay.items.filter((i) => i.id !== firstAffected.item.id),
            };
          }
        } else if (choiceId === 'MOVE_TO_NEXT_DAY') {
          const lastAffected = activeCascadeReport.affectedItems[activeCascadeReport.affectedItems.length - 1];
          if (lastAffected && currentTrip.days[activeDayIndex + 1]) {
            // Remove from current day, add to next day
            updatedDay = {
              ...currentDay,
              items: currentDay.items.filter((i) => i.id !== lastAffected.item.id),
            };
            const nextDay = currentTrip.days[activeDayIndex + 1];
            const updatedNextDay: DayPlan = {
              ...nextDay,
              items: [
                ...nextDay.items,
                {
                  ...lastAffected.item,
                  dayId: nextDay.id,
                  order: nextDay.items.length + 1,
                  timeSlot: { plannedStart: '17:00', plannedEnd: '18:30' },
                },
              ],
            };

            const updatedDays = currentTrip.days.map((d, idx) => {
              if (idx === activeDayIndex) return updatedDay;
              if (idx === activeDayIndex + 1) return updatedNextDay;
              return d;
            });

            const updatedTrip = { ...currentTrip, days: updatedDays, updatedAt: new Date().toISOString() };
            set((state) => ({
              currentTrip: updatedTrip,
              guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
              activeCascadeReport: null,
            }));
            return;
          }
        }

        const updatedDays = currentTrip.days.map((d, idx) =>
          idx === activeDayIndex ? updatedDay : d
        );

        const updatedTrip = { ...currentTrip, days: updatedDays, updatedAt: new Date().toISOString() };
        set((state) => ({
          currentTrip: updatedTrip,
          guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
          activeCascadeReport: null,
        }));
      },

      dismissCascade: () => {
        set({ activeCascadeReport: null });
      },

      addExpense: (expenseData) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const newExpense: Expense = {
          ...expenseData,
          id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          createdAt: new Date().toISOString(),
        };

        const updatedTrip = {
          ...currentTrip,
          expenses: [newExpense, ...currentTrip.expenses],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          currentTrip: updatedTrip,
          guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
        }));
      },

      togglePackingItem: (itemId) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedList = currentTrip.packingList.map((item) =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        );

        const updatedTrip = { ...currentTrip, packingList: updatedList };
        set((state) => ({
          currentTrip: updatedTrip,
          guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
        }));
      },

      registerPdfExport: (snapshot) => {
        const { currentTrip } = get();
        if (!currentTrip) return;

        const updatedTrip = {
          ...currentTrip,
          exportHistory: [snapshot, ...currentTrip.exportHistory],
        };

        set((state) => ({
          currentTrip: updatedTrip,
          guestTrips: state.guestTrips.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)),
        }));
      },

      enterWhatIfMode: () => {
        const { currentTrip } = get();
        if (!currentTrip) return;
        set({
          isWhatIfMode: true,
          whatIfTripFork: JSON.parse(JSON.stringify(currentTrip)),
        });
      },

      modifyWhatIfBudget: (newBudget) => {
        const { whatIfTripFork } = get();
        if (!whatIfTripFork) return;
        set({
          whatIfTripFork: {
            ...whatIfTripFork,
            totalPlannedBudget: newBudget,
            budgetPerPerson: Math.round(newBudget / whatIfTripFork.travelerCount),
          },
        });
      },

      applyWhatIfChanges: () => {
        const { whatIfTripFork } = get();
        if (!whatIfTripFork) return;

        set((state) => ({
          currentTrip: whatIfTripFork,
          guestTrips: state.guestTrips.map((t) => (t.id === whatIfTripFork.id ? whatIfTripFork : t)),
          isWhatIfMode: false,
          whatIfTripFork: null,
        }));
      },

      discardWhatIfChanges: () => {
        set({
          isWhatIfMode: false,
          whatIfTripFork: null,
        });
      },
    }),
    {
      name: 'yourtrip_tripos_state',
      storage: createJSONStorage(() => idbStorage),
      partialize: (state) => ({
        currentTrip: state.currentTrip,
        guestTrips: state.guestTrips,
      }),
    }
  )
);
