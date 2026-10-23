import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ItineraryItem,
  ActivityStatus,
} from '@/types/trip';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { formatTimeDisplay, formatCurrency } from '@/lib/utils';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ClockAlert,
  FastForward,
  Info,
  Sun,
  Users,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

interface ActivityCardProps {
  item: ItineraryItem;
  isSelected?: boolean;
  onSelect?: () => void;
  onStatusChange: (status: ActivityStatus) => void;
  onTriggerDelay: (minutes: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  item,
  isSelected,
  onSelect,
  onStatusChange,
  onTriggerDelay,
}) => {
  const [showDelayOptions, setShowDelayOptions] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const statusBadges: Record<ActivityStatus, { label: string; color: string }> = {
    PLANNED: { label: 'Planned', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' },
    DONE: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    DELAYED: { label: 'Shifted / Delayed', color: 'bg-rose-100 text-rose-800 border-rose-300' },
    SKIPPED: { label: 'Skipped', color: 'bg-slate-200 text-slate-500 line-through border-slate-300' },
    REPLACED: { label: 'Replaced', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  };

  const isSkipped = item.status === 'SKIPPED';
  const isDone = item.status === 'DONE';

  return (
    <motion.div
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 280 }}
      className={`relative pl-8 transition-opacity ${isSkipped ? 'opacity-50' : 'opacity-100'}`}
    >
      {/* Timeline Waypoint Node */}
      <div
        className={`absolute left-2.5 top-6 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all ${
          isDone
            ? 'bg-emerald-500 border-white ring-2 ring-emerald-300'
            : item.status === 'DELAYED'
            ? 'bg-rose-500 border-white ring-2 ring-rose-300'
            : isSelected
            ? 'bg-terracotta-500 border-white ring-4 ring-terracotta-200'
            : 'bg-white border-terracotta-500'
        }`}
      />

      <Card
        onClick={onSelect}
        selected={isSelected}
        hoverable
        className="relative overflow-hidden group"
      >
        {/* Top Header: Category & Timing */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Badge variant="category" category={item.category}>
              {item.category}
            </Badge>
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-semibold border ${statusBadges[item.status].color}`}
            >
              {statusBadges[item.status].label}
            </span>
          </div>

          {/* Time Slot display (Planned vs Actual) */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-canvas-100 px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5 text-terracotta-500 shrink-0" />
            {item.timeSlot.actualStart && item.timeSlot.actualStart !== item.timeSlot.plannedStart ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 line-through">
                  {formatTimeDisplay(item.timeSlot.plannedStart)} – {formatTimeDisplay(item.timeSlot.plannedEnd)}
                </span>
                <span className="text-rose-600 font-bold">
                  {formatTimeDisplay(item.timeSlot.actualStart)}
                  {item.timeSlot.actualEnd && ` – ${formatTimeDisplay(item.timeSlot.actualEnd)}`}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wide px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                  Actual
                </span>
              </div>
            ) : (
              <span>
                {formatTimeDisplay(item.timeSlot.plannedStart)} – {formatTimeDisplay(item.timeSlot.plannedEnd)}
              </span>
            )}
          </div>
        </div>

        {/* Title & Location */}
        <div className="mb-2">
          <h4 className="text-base font-bold text-slate-900 group-hover:text-terracotta-600 transition-colors">
            {item.title}
          </h4>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{item.location.address || item.location.name}</span>
            {item.location.openingHours && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-medium">Open: {item.location.openingHours}</span>
              </>
            )}
          </div>
        </div>

        {/* Context Badges: Weather, Crowd, Cost */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 my-2.5">
          {item.weatherForecast && (
            <div className="flex items-center gap-1 bg-amber-50/70 border border-amber-200/60 px-2 py-0.5 rounded-lg text-amber-900 font-medium">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>{item.weatherForecast.value.temperatureC}°C {item.weatherForecast.value.condition}</span>
              <ProvenanceBadge provenance={item.weatherForecast.provenance} showIcon={false} />
            </div>
          )}

          {item.expectedCrowd && (
            <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-medium">
              <Users className="w-3 h-3 text-slate-500" />
              <span>{item.expectedCrowd.value} Crowd</span>
              <ProvenanceBadge provenance={item.expectedCrowd.provenance} showIcon={false} />
            </div>
          )}

          {item.estimatedCost && (
            <div className="flex items-center gap-1 bg-canvas-100 border border-canvas-200 px-2 py-0.5 rounded-lg text-slate-800 font-semibold">
              <span>{item.estimatedCost.value === 0 ? 'Free Entry' : `~${formatCurrency(item.estimatedCost.value)}`}</span>
              <ProvenanceBadge provenance={item.estimatedCost.provenance} showIcon={false} />
            </div>
          )}
        </div>

        {/* Explainability / "Why Recommended" Accordion */}
        {item.whyRecommended && (
          <div className="my-2 text-xs bg-canvas-50 border border-canvas-200 rounded-xl p-2.5 text-slate-600">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowWhy(!showWhy);
              }}
              className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-terracotta-600 min-h-[32px]"
            >
              <Info className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Why is this scheduled at this time?</span>
            </button>
            {showWhy && (
              <p className="mt-1.5 text-slate-600 leading-relaxed font-normal">
                {item.whyRecommended}
              </p>
            )}
          </div>
        )}

        {/* Real-Life Trip Quick Actions */}
        <div className="pt-3 mt-3 border-t border-canvas-100 flex flex-wrap items-center justify-between gap-2">
          {/* Status buttons */}
          <div className="flex items-center gap-2">
            {item.status !== 'DONE' && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('DONE');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </button>
            )}

            {/* Delay Cascade Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDelayOptions(!showDelayOptions);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] text-xs font-semibold rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs active:scale-95"
              >
                <ClockAlert className="w-3.5 h-3.5" />
                <span>Delay...</span>
              </button>

              {/* Delay Quick Selector Dropdown */}
              {showDelayOptions && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 bottom-full mb-1 z-30 bg-white rounded-2xl shadow-xl border border-canvas-300 p-2 flex gap-1.5 min-w-[200px]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerDelay(15);
                      setShowDelayOptions(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-xl hover:bg-canvas-100 text-slate-700 min-h-[38px]"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerDelay(30);
                      setShowDelayOptions(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-xl hover:bg-canvas-100 text-slate-700 min-h-[38px]"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerDelay(45);
                      setShowDelayOptions(false);
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 min-h-[38px]"
                  >
                    +45m
                  </button>
                </div>
              )}
            </div>

            {/* Skip button */}
            {!isSkipped && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('SKIPPED');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] text-xs font-medium rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>
            )}
          </div>

          <span className="text-[11px] text-slate-400 font-medium">
            Duration: {item.durationMinutes}m
          </span>
        </div>
      </Card>
    </motion.div>
  );
};
