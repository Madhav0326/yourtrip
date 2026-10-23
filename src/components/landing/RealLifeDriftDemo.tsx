'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  FastForward,
  Scissors,
  CalendarPlus,
  Car,
  Sun,
  Utensils,
  MapPin,
  CheckCircle2,
  Check,
} from 'lucide-react';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { formatTimeDisplay } from '@/lib/utils';
import {
  ResolutionOptionId,
  SCENARIO_PLANNED,
  SCENARIO_DELAYED,
  SCENARIO_SHIFT_ALL,
  SCENARIO_SHORTEN,
  SCENARIO_SKIP,
  SCENARIO_MOVE_TOMORROW,
  PRODUCT_LOOP_STEPS,
} from '@/lib/driftDemoData';

export const RealLifeDriftDemo: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  // Simulation state
  const [isDelayed, setIsDelayed] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState<ResolutionOptionId | null>(null);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(0);

  // Transition animations
  const springTransition = shouldReduceMotion
    ? { duration: 0.05 }
    : { type: 'spring', damping: 24, stiffness: 260 };

  // Trigger simulated delay
  const handleSimulateDelay = () => {
    setIsDelayed(true);
    setSelectedResolution(null);
    setActiveLoopStep(2); // Reality changes
  };

  // Reset to original plan
  const handleReset = () => {
    setIsDelayed(false);
    setSelectedResolution(null);
    setActiveLoopStep(0); // Plan
  };

  // Apply user-selected resolution
  const handleSelectResolution = (optionId: ResolutionOptionId) => {
    setSelectedResolution(optionId);
    setActiveLoopStep(4); // Continue
  };

  // Select current active scenario data
  const currentScenario = !isDelayed
    ? SCENARIO_PLANNED
    : !selectedResolution
    ? SCENARIO_DELAYED
    : selectedResolution === 'SHIFT_ALL'
    ? SCENARIO_SHIFT_ALL
    : selectedResolution === 'SHORTEN'
    ? SCENARIO_SHORTEN
    : selectedResolution === 'SKIP'
    ? SCENARIO_SKIP
    : SCENARIO_MOVE_TOMORROW;

  const { activities, legs, summaryMessage } = currentScenario;

  return (
    <section className="w-full max-w-5xl mx-auto my-12 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-terracotta-50 border border-terracotta-200 text-terracotta-700 text-xs font-bold tracking-wide uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5 text-terracotta-500 animate-pulse" />
          <span>Interactive Product Demonstration</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          When real travel drifts, YourTrip{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 via-amber-600 to-terracotta-500">
            adapts with you.
          </span>
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Itineraries shouldn&apos;t shatter when you run 45 minutes late. Test our cascade engine
          below to see how downstream impacts are analyzed and resolved—without silent overwrites.
        </p>
      </div>

      {/* Main Interactive Demo Card */}
      <div className="bg-white/95 backdrop-blur-md rounded-4xl border border-canvas-200 shadow-elevated overflow-hidden">
        {/* 1. VISUAL PRODUCT LOOP RIBBON */}
        <div className="bg-canvas-100/90 border-b border-canvas-200 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Continuous Travel Loop</span>
            </span>
            <span className="text-[11px] font-semibold text-terracotta-600 bg-terracotta-50 px-2.5 py-0.5 rounded-full border border-terracotta-200">
              AI Assists, You Decide
            </span>
          </div>

          {/* 5-step loop progress line */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {PRODUCT_LOOP_STEPS.map((step) => {
              const isActive = activeLoopStep === step.id;
              const isPast = activeLoopStep > step.id;
              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => {
                    setActiveLoopStep(step.id);
                    if (step.id <= 1) {
                      setIsDelayed(false);
                      setSelectedResolution(null);
                    } else if (step.id === 2 || step.id === 3) {
                      setIsDelayed(true);
                      setSelectedResolution(null);
                    }
                  }}
                  className={`text-left p-2.5 rounded-2xl border transition-all text-xs ${
                    isActive
                      ? 'bg-white border-terracotta-500 shadow-warm ring-2 ring-terracotta-200'
                      : isPast
                      ? 'bg-canvas-50 border-emerald-300 text-slate-700'
                      : 'bg-white/60 border-canvas-200 text-slate-500 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isActive
                          ? 'text-terracotta-600'
                          : isPast
                          ? 'text-emerald-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                    {isPast && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <div className="font-bold text-slate-900 text-xs truncate">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SIMULATION TRIGGER BAR */}
        <div className="p-4 sm:p-6 bg-canvas-50/60 border-b border-canvas-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Live Simulation Scenario:</span>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isDelayed
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {isDelayed ? '⚡ 45 min Delay Active' : '● On Schedule'}
              </span>
            </div>
            <p className="text-xs text-slate-500 max-w-lg">
              {summaryMessage}
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isDelayed ? (
              <button
                type="button"
                onClick={handleSimulateDelay}
                className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-warm hover:shadow-elevated transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>Simulate: &quot;You&apos;re running 45 min late&quot;</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-white hover:bg-canvas-100 text-slate-700 border border-canvas-300 font-semibold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Planned Schedule</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. ALERT BANNER WHEN DELAY OCCURS */}
        <AnimatePresence>
          {isDelayed && !selectedResolution && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              className="bg-amber-50/90 border-b border-amber-200 px-4 sm:px-6 py-3.5 text-amber-950 overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start sm:items-center gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="font-extrabold text-amber-900">
                      Cascade Conflict Detected:
                    </span>{' '}
                    <span>
                      Lingering 45m at Fort Aguada pushed downstream activities past buffer limits.
                      Sunset at Baga Beach (6:05 PM) is compromised!
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-amber-200/60 text-amber-900 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                    3 stops affected
                  </span>
                  <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                    Sunset at risk
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. THE INTERACTIVE TIMELINE (PLANNED vs ACTUAL) */}
        <div className="p-4 sm:p-8 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Goa Day 1 • Afternoon & Evening Schedule
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Planned vs Actual Timing
            </span>
          </div>

          <div className="relative pl-3">
            {/* Vertical spine timeline line */}
            <div className="absolute left-[23px] top-6 bottom-6 w-0.5 bg-canvas-300 pointer-events-none" />

            {activities.map((activity, index) => {
              const leg = legs[index];
              const isDelayedActivity = activity.status === 'DELAYED';
              const isSkippedActivity = activity.status === 'SKIPPED';
              const isShortenedActivity = activity.status === 'SHORTENED';

              return (
                <React.Fragment key={activity.id}>
                  {/* Activity Item Card */}
                  <motion.div
                    layout
                    transition={springTransition}
                    className={`relative pl-8 transition-opacity ${
                      isSkippedActivity ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    {/* Waypoint circle pin on the spine */}
                    <div
                      className={`absolute left-[13px] top-5 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
                        activity.status === 'ON_TIME'
                          ? 'bg-emerald-500 border-white ring-2 ring-emerald-200'
                          : isDelayedActivity
                          ? 'bg-rose-500 border-white ring-2 ring-rose-200 animate-pulse'
                          : isShortenedActivity
                          ? 'bg-terracotta-500 border-white ring-2 ring-terracotta-200'
                          : 'bg-slate-300 border-white'
                      }`}
                    />

                    {/* Card Container */}
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        activity.isSunsetRisk && !selectedResolution
                          ? 'bg-rose-50/70 border-rose-300 shadow-warm'
                          : isDelayedActivity
                          ? 'bg-amber-50/50 border-amber-200 shadow-2xs'
                          : isShortenedActivity
                          ? 'bg-terracotta-50/50 border-terracotta-200 shadow-2xs'
                          : 'bg-white border-canvas-200 hover:border-canvas-300 shadow-subtle'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Title & Category */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-canvas-100 text-slate-700">
                              {activity.category}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <span>{activity.location}</span>
                            </span>
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900">
                            {activity.name}
                          </h4>
                        </div>

                        {/* Timing: Planned vs Actual */}
                        <div className="text-left sm:text-right shrink-0">
                          {/* Strikethrough planned time if shifted */}
                          {activity.currentStart !== activity.originalStart && (
                            <div className="text-[11px] text-slate-400 line-through">
                              Planned: {formatTimeDisplay(activity.originalStart)} –{' '}
                              {formatTimeDisplay(activity.originalEnd)}
                            </div>
                          )}

                          <div className="flex items-center sm:justify-end gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-terracotta-500" />
                            <span
                              className={`font-black text-sm ${
                                isDelayedActivity
                                  ? 'text-rose-600'
                                  : isShortenedActivity
                                  ? 'text-terracotta-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {activity.currentStart === '—'
                                ? 'Skipped'
                                : `${formatTimeDisplay(activity.currentStart)} – ${formatTimeDisplay(
                                    activity.currentEnd
                                  )}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag Note */}
                      {activity.tagNote && (
                        <div className="mt-2.5 pt-2 border-t border-canvas-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                          <span
                            className={`font-medium ${
                              activity.isSunsetRisk && !selectedResolution
                                ? 'text-rose-700 font-bold'
                                : isDelayedActivity
                                ? 'text-amber-800'
                                : 'text-slate-600'
                            }`}
                          >
                            {activity.tagNote}
                          </span>

                          {activity.category === 'BEACH' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              <Sun className="w-3 h-3 text-amber-600" />
                              <span>Sunset: 6:05 PM</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Travel Leg connector */}
                  {leg && index < activities.length - 1 && (
                    <motion.div
                      layout
                      transition={springTransition}
                      className="relative pl-8 my-1 flex items-center gap-2 select-none"
                    >
                      <div className="w-6 h-6 rounded-full bg-canvas-200 text-slate-600 flex items-center justify-center text-[10px] shadow-2xs">
                        <Car className="w-3 h-3" />
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 bg-canvas-100/80 px-2.5 py-1 rounded-lg border border-canvas-200 flex items-center gap-2">
                        <span>
                          {leg.currentMins} min {leg.mode.toLowerCase()} to {leg.to}
                        </span>
                        {leg.isDelayed && (
                          <span className="text-amber-700 font-bold bg-amber-100 px-1.5 py-0.2 rounded text-[10px]">
                            +10m traffic
                          </span>
                        )}
                        <ProvenanceBadge provenance="LIVE" label={`${leg.traffic} traffic`} />
                      </div>
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 5. USER-CONTROLLED RESOLUTION CHOICES (THE 4 CORE OPTIONS) */}
        <div className="p-4 sm:p-6 bg-canvas-100/70 border-t border-canvas-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-terracotta-600 block">
                Decision Hub • AI Assists, You Decide
              </span>
              <h3 className="text-base font-black text-slate-900">
                {isDelayed
                  ? 'Choose how you want to resolve this delay:'
                  : '4 Adaptive Resolution Options Ready When Reality Changes:'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              The system will <strong className="text-slate-800">never silently change</strong> your
              plan.
            </span>
          </div>

          {/* 4 Choices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OPTION 1: Shift Everything */}
            <div
              onClick={() => handleSelectResolution('SHIFT_ALL')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedResolution === 'SHIFT_ALL'
                  ? 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-200 shadow-warm'
                  : 'bg-white border-canvas-300 hover:border-terracotta-400 hover:shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <FastForward className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      1. Shift Everything
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Preserves all stops
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Pushes lunch, beach, and dinner forward. Fort Aguada stays relaxed; day concludes
                  at 10:30 PM with late dinner seating.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-canvas-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500 font-medium">Impact: +45m Day End</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    selectedResolution === 'SHIFT_ALL'
                      ? 'text-terracotta-600'
                      : 'text-slate-400 group-hover:text-terracotta-600'
                  }`}
                >
                  {selectedResolution === 'SHIFT_ALL' ? 'Applied ✓' : 'Select'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* OPTION 2: Shorten Fort Aguada (Recommended) */}
            <div
              onClick={() => handleSelectResolution('SHORTEN')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedResolution === 'SHORTEN'
                  ? 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-200 shadow-warm'
                  : 'bg-white border-canvas-300 hover:border-terracotta-400 hover:shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      2. Shorten This Stop
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    AI Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Wrap up Fort Aguada now. Recovers all 45 mins, restores original 3:45 PM lunch, and
                  guarantees prime 6:05 PM beach sunset.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-canvas-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-emerald-700 font-medium">
                  Impact: Full Recovery
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    selectedResolution === 'SHORTEN'
                      ? 'text-terracotta-600'
                      : 'text-slate-400 group-hover:text-terracotta-600'
                  }`}
                >
                  {selectedResolution === 'SHORTEN' ? 'Applied ✓' : 'Select'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* OPTION 3: Skip a Stop */}
            <div
              onClick={() => handleSelectResolution('SKIP')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedResolution === 'SKIP'
                  ? 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-200 shadow-warm'
                  : 'bg-white border-canvas-300 hover:border-terracotta-400 hover:shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      3. Skip a Stop (Lunch)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    Saves 75 mins
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Bypass sit-down restaurant sitting; grab fresh beach shacks at Baga Beach instead.
                  Drive direct to beach and catch full sunset.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-canvas-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-purple-700 font-medium">
                  Impact: Arrive Early at Beach
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    selectedResolution === 'SKIP'
                      ? 'text-terracotta-600'
                      : 'text-slate-400 group-hover:text-terracotta-600'
                  }`}
                >
                  {selectedResolution === 'SKIP' ? 'Applied ✓' : 'Select'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* OPTION 4: Move Activity to Tomorrow */}
            <div
              onClick={() => handleSelectResolution('MOVE_TOMORROW')}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedResolution === 'MOVE_TOMORROW'
                  ? 'bg-terracotta-50 border-terracotta-500 ring-2 ring-terracotta-200 shadow-warm'
                  : 'bg-white border-canvas-300 hover:border-terracotta-400 hover:shadow-subtle'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center">
                      <CalendarPlus className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900">
                      4. Move to Tomorrow
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-50 text-forest-800">
                    Relaxed Evening
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Keep afternoon relaxed. Move Thalassa dinner reservation to Day 2 evening. Enjoy a
                  spontaneous twilight beach walk without rushing.
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-canvas-200 flex items-center justify-between text-xs">
                <span className="text-[11px] text-forest-700 font-medium">
                  Impact: Zero Rush Tonight
                </span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    selectedResolution === 'MOVE_TOMORROW'
                      ? 'text-terracotta-600'
                      : 'text-slate-400 group-hover:text-terracotta-600'
                  }`}
                >
                  {selectedResolution === 'MOVE_TOMORROW' ? 'Applied ✓' : 'Select'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6. PILLARS: "AI ASSISTS, YOU DECIDE" REINFORCEMENT BANNER */}
        <div className="px-6 py-4 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-terracotta-500 flex items-center justify-center text-white shrink-0 font-bold">
              OS
            </div>
            <div>
              <span className="font-bold text-white block">
                The YourTrip Guarantee:
              </span>
              <span className="text-slate-400 text-[11px]">
                AI analyzes traffic, weather & closing hours. But you are always in the driver seat.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Recommends</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Explains</span>
            </span>
            <span className="inline-flex items-center gap-1 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Predicts</span>
            </span>
            <span className="inline-flex items-center gap-1 text-terracotta-400 font-bold">
              <Check className="w-3.5 h-3.5 text-terracotta-400" />
              <span>You Decide</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
