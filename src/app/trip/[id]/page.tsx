'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTripStore } from '@/store/tripStore';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { DaySelector } from '@/components/workspace/DaySelector';
import { ActivityCard } from '@/components/itinerary/ActivityCard';
import { TravelRouteLeg } from '@/components/itinerary/TravelRouteLeg';
import { InteractiveMap } from '@/components/itinerary/InteractiveMap';
import { CascadeModal } from '@/components/itinerary/CascadeModal';
import { PdfExportModal } from '@/components/pdf/PdfExportModal';
import { FeasibilityModal } from '@/components/workspace/FeasibilityModal';
import { ExpenseModal } from '@/components/workspace/ExpenseModal';
import { PackingModal } from '@/components/workspace/PackingModal';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Map,
  IndianRupee,
  Luggage,
  Sparkles,
  Compass,
  Plus,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { addMinutesToTime } from '@/lib/utils';

export default function TripWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const {
    currentTrip,
    loadTripById,
    activeDayIndex,
    setActiveDayIndex,
    selectedActivityId,
    setSelectedActivityId,
    setActivityStatus,
    triggerDelayCheck,
    activeCascadeReport,
    applyCascadeChoice,
    dismissCascade,
  } = useTripStore();

  const [isLoaded, setIsLoaded] = useState(false);
  const [mobileTab, setMobileTab] = useState<'TIMELINE' | 'MAP'>('TIMELINE');

  // Modals state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isRealityModalOpen, setIsRealityModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPackingModalOpen, setIsPackingModalOpen] = useState(false);

  useEffect(() => {
    if (tripId) {
      const found = loadTripById(tripId);
      if (!found && !currentTrip) {
        // Fallback: if not found, redirect to home
        router.push('/');
      }
    }
    setIsLoaded(true);
  }, [tripId, loadTripById, currentTrip, router]);

  if (!isLoaded || !currentTrip) {
    return (
      <div className="min-h-screen bg-canvas-50 flex flex-col items-center justify-center p-6 text-center">
        <Compass className="w-10 h-10 text-terracotta-500 animate-spin-slow mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Loading Trip Workspace...</h2>
        <p className="text-xs text-slate-400 mt-1">Reading local-first storage</p>
      </div>
    );
  }

  const activeDay = currentTrip.days[activeDayIndex] || currentTrip.days[0];

  const handleTriggerDelay = (activityId: string, delayMinutes: number) => {
    const item = activeDay.items.find((i) => i.id === activityId);
    if (!item) return;

    const newStart = addMinutesToTime(item.timeSlot.plannedStart, delayMinutes);
    triggerDelayCheck(activityId, newStart);
  };

  return (
    <div className="min-h-screen bg-canvas-50 flex flex-col">
      {/* 1. Global Header */}
      <WorkspaceHeader
        trip={currentTrip}
        onOpenPdfModal={() => setIsPdfModalOpen(true)}
        onOpenRealityCheck={() => setIsRealityModalOpen(true)}
        onOpenExpenses={() => setIsExpenseModalOpen(true)}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex flex-col pb-24 md:pb-12">
        {/* Day Selector & Contextual Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <DaySelector
            days={currentTrip.days}
            activeDayIndex={activeDayIndex}
            onSelectDay={setActiveDayIndex}
          />

          {/* Quick Hub buttons: Packing & Splitwise */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsPackingModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-canvas-100 text-slate-700 border border-canvas-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Luggage className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Packing List</span>
            </button>
            <button
              type="button"
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-canvas-100 text-slate-700 border border-canvas-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <IndianRupee className="w-3.5 h-3.5 text-forest-500" />
              <span>Split Expenses</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher (Timeline vs Map) */}
        <div className="md:hidden flex bg-canvas-200/80 p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setMobileTab('TIMELINE')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              mobileTab === 'TIMELINE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Itinerary Schedule
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('MAP')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              mobileTab === 'MAP' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Spatial Map View
          </button>
        </div>

        {/* Dual Pane Layout: Left Itinerary Timeline, Right Interactive Spatial Map */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left: Day Timeline (Cols 7 on Desktop) */}
          <div
            className={`md:col-span-7 space-y-4 ${
              mobileTab === 'MAP' ? 'hidden md:block' : 'block'
            }`}
          >
            {/* Day Header Info */}
            <div className="bg-white/80 backdrop-blur-xs p-4 rounded-3xl border border-canvas-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-terracotta-600">
                  Day {activeDay.dayNumber} Theme
                </span>
                <h2 className="text-lg font-black text-slate-900">{activeDay.themeTitle}</h2>
              </div>
              <span className="text-xs font-semibold bg-canvas-100 text-slate-600 px-3 py-1 rounded-xl">
                {activeDay.items.length} Activities
              </span>
            </div>

            {/* Activities List */}
            <div className="relative pl-2">
              {/* Continuous vertical timeline guide line */}
              <div className="absolute left-[27px] top-4 bottom-8 w-0.5 bg-canvas-300 pointer-events-none" />

              {activeDay.items.map((item, index) => (
                <React.Fragment key={item.id}>
                  {/* Travel leg connector from previous stop */}
                  {item.travelFromPrevious && (
                    <TravelRouteLeg leg={item.travelFromPrevious} />
                  )}

                  {/* Activity Card */}
                  <div className="my-2">
                    <ActivityCard
                      item={item}
                      isSelected={item.id === selectedActivityId}
                      onSelect={() => setSelectedActivityId(item.id)}
                      onStatusChange={(status) => setActivityStatus(item.id, status)}
                      onTriggerDelay={(mins) => handleTriggerDelay(item.id, mins)}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right: Spatial Map Canvas (Cols 5 on Desktop, sticky) */}
          <div
            className={`md:col-span-5 md:sticky md:top-24 ${
              mobileTab === 'TIMELINE' ? 'hidden md:block' : 'block'
            }`}
          >
            <InteractiveMap
              items={activeDay.items}
              selectedActivityId={selectedActivityId}
              onSelectActivity={setSelectedActivityId}
              destination={currentTrip.destination}
            />
          </div>
        </div>
      </main>

      {/* Cascade Resolver Modal */}
      <CascadeModal
        isOpen={Boolean(activeCascadeReport)}
        report={activeCascadeReport}
        onClose={dismissCascade}
        onSelectOption={(choiceId) => applyCascadeChoice(choiceId)}
      />

      {/* PDF Export Studio Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        trip={currentTrip}
      />

      {/* Reality Check & What-If Sandbox Modal */}
      <FeasibilityModal
        isOpen={isRealityModalOpen}
        onClose={() => setIsRealityModalOpen(false)}
        trip={currentTrip}
        activeDay={activeDay}
      />

      {/* Group Splitwise Expense Modal */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        trip={currentTrip}
      />

      {/* Smart Packing Modal */}
      <PackingModal
        isOpen={isPackingModalOpen}
        onClose={() => setIsPackingModalOpen(false)}
        trip={currentTrip}
      />

      {/* Mobile Ergonomic Bottom Dock */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-canvas-200 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => setMobileTab('TIMELINE')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            mobileTab === 'TIMELINE' ? 'text-terracotta-600' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Timeline</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('MAP')}
          className={`flex flex-col items-center text-[10px] font-bold ${
            mobileTab === 'MAP' ? 'text-terracotta-600' : 'text-slate-400'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span>Map</span>
        </button>
        <button
          type="button"
          onClick={() => setIsExpenseModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-slate-700"
        >
          <IndianRupee className="w-5 h-5 mb-0.5" />
          <span>Split</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPackingModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-slate-700"
        >
          <Luggage className="w-5 h-5 mb-0.5" />
          <span>Pack</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPdfModalOpen(true)}
          className="flex flex-col items-center text-[10px] font-bold text-slate-400 hover:text-slate-700"
        >
          <Sliders className="w-5 h-5 mb-0.5" />
          <span>Export</span>
        </button>
      </nav>
    </div>
  );
}
