import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Trip, DayPlan } from '@/types/trip';
import { useTripStore } from '@/store/tripStore';
import { formatCurrency } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  Footprints,
  Clock,
  Sparkles,
  Sliders,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

interface FeasibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  activeDay: DayPlan;
}

export const FeasibilityModal: React.FC<FeasibilityModalProps> = ({
  isOpen,
  onClose,
  trip,
  activeDay,
}) => {
  const { isWhatIfMode, enterWhatIfMode, modifyWhatIfBudget, applyWhatIfChanges, discardWhatIfChanges, whatIfTripFork } =
    useTripStore();

  const [simulatedBudget, setSimulatedBudget] = useState(trip.totalPlannedBudget + 10000);
  const [activeTab, setActiveTab] = useState<'FEASIBILITY' | 'WHAT_IF'>('FEASIBILITY');

  // Compute metrics for active day
  const locationCount = activeDay.items.length;
  const totalTravelMins = activeDay.items.reduce(
    (acc, item) => acc + (item.travelFromPrevious?.durationMinutes || 0),
    0
  );
  const estimatedWalkingKm = Number((locationCount * 1.8).toFixed(1));
  const isPacingRushed = locationCount > 4 || totalTravelMins > 90;

  const handleStartWhatIf = () => {
    enterWhatIfMode();
    modifyWhatIfBudget(simulatedBudget);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trip Reality Check & What-If Sandbox"
      description="Evaluate your schedule's feasibility and test hypothetical adjustments without altering your active plan."
      className="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Tab switch */}
        <div className="flex bg-canvas-100 p-1 rounded-2xl border border-canvas-200">
          <button
            type="button"
            onClick={() => setActiveTab('FEASIBILITY')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'FEASIBILITY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pacing & Feasibility Check
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WHAT_IF')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'WHAT_IF'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hypothetical What-If Sandbox
          </button>
        </div>

        {activeTab === 'FEASIBILITY' ? (
          <div className="space-y-4">
            {/* Feasibility Verdict Box */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
                isPacingRushed
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {isPacingRushed ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="font-bold text-sm">
                  {isPacingRushed
                    ? `Day ${activeDay.dayNumber} is possible, but it may feel rushed.`
                    : `Day ${activeDay.dayNumber} has a balanced and comfortable rhythm.`}
                </h4>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {isPacingRushed
                    ? `With ${locationCount} locations and ${totalTravelMins} minutes in transit, there is little buffer for delays or relaxed dining. Consider spacing out evening stops.`
                    : `Sensible travel legs and visit durations leave plenty of time for spontaneous discoveries, meals, and rest.`}
                </p>
              </div>
            </div>

            {/* Metric Tiles */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-canvas-50 border border-canvas-200 p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Stops</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{locationCount}</span>
                <span className="text-[10px] text-slate-400">Locations</span>
              </div>
              <div className="bg-canvas-50 border border-canvas-200 p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Travel</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{totalTravelMins}m</span>
                <span className="text-[10px] text-slate-400">Total in transit</span>
              </div>
              <div className="bg-canvas-50 border border-canvas-200 p-3.5 rounded-2xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Walking</span>
                <span className="text-xl font-black text-slate-900 mt-1 block">{estimatedWalkingKm} km</span>
                <span className="text-[10px] text-slate-400">Fatigue Index</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 text-xs text-indigo-950">
              <div className="flex items-center gap-2 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Sandbox Mode: Test Changes Safely</span>
              </div>
              <p className="text-indigo-800 leading-relaxed">
                Hypothetical changes run on an immutable copy of your trip. Nothing is modified in your active itinerary until you explicitly click &quot;Apply Changes&quot;.
              </p>
            </div>

            {/* Slider: Test increased or decreased budget */}
            <div className="bg-canvas-50 border border-canvas-200 p-4 rounded-2xl">
              <label className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                <span>Simulate Total Budget:</span>
                <span className="text-terracotta-600 text-sm font-black">{formatCurrency(simulatedBudget)}</span>
              </label>
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={simulatedBudget}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimulatedBudget(val);
                  if (isWhatIfMode) modifyWhatIfBudget(val);
                }}
                className="w-full accent-terracotta-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>₹20,000</span>
                <span>Per person: {formatCurrency(Math.round(simulatedBudget / trip.travelerCount))}</span>
                <span>₹1,50,000</span>
              </div>
            </div>

            {/* Sandbox Action buttons */}
            <div className="flex items-center justify-between pt-2">
              {!isWhatIfMode ? (
                <Button size="sm" variant="amber" onClick={handleStartWhatIf}>
                  Preview Simulated Impact
                </Button>
              ) : (
                <div className="flex items-center gap-2 w-full justify-between">
                  <Button size="sm" variant="ghost" onClick={discardWhatIfChanges}>
                    <X className="w-3.5 h-3.5 mr-1" />
                    Discard Simulation
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      applyWhatIfChanges();
                      onClose();
                    }}
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Apply Changes to Trip
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-canvas-200 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
