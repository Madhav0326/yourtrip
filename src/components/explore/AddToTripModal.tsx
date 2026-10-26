'use client';

import React, { useState, useMemo } from 'react';
import { AttractionOption } from '@/types/explore';
import { DayPlan } from '@/types/trip';
import { ProvenanceBadge } from '@/components/ui/ProvenanceBadge';
import { addMinutesToTime, parseMinutesFromTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';

interface AddToTripModalProps {
  place: AttractionOption | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    dayId: string,
    timeSlot: { plannedStart: string; plannedEnd: string }
  ) => void;
  days: DayPlan[];
  initialDayId?: string;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  place,
  isOpen,
  onClose,
  onConfirm,
  days,
  initialDayId,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>(
    initialDayId || days[0]?.id || ''
  );
  const [startTime, setStartTime] = useState<string>('14:00');

  // Sync initial day when opened
  React.useEffect(() => {
    if (initialDayId) {
      setSelectedDayId(initialDayId);
    } else if (days[0]) {
      setSelectedDayId(days[0].id);
    }
  }, [initialDayId, days, isOpen]);

  const durationMinutes = place?.recommendedDurationMinutes || 60;
  const endTime = useMemo(() => {
    return addMinutesToTime(startTime, durationMinutes);
  }, [startTime, durationMinutes]);

  const selectedDay = useMemo(() => {
    return days.find((d) => d.id === selectedDayId) || days[0];
  }, [days, selectedDayId]);

  // Conflict Detection Preview
  const conflictingItem = useMemo(() => {
    if (!selectedDay || !place) return null;
    const newStartM = parseMinutesFromTime(startTime);
    const newEndM = parseMinutesFromTime(endTime);

    for (const item of selectedDay.items) {
      const itemStartM = parseMinutesFromTime(item.timeSlot.plannedStart);
      const itemEndM = parseMinutesFromTime(item.timeSlot.plannedEnd);

      // Overlap condition: startA < endB && endA > startB
      if (newStartM < itemEndM && newEndM > itemStartM) {
        return item;
      }
    }
    return null;
  }, [selectedDay, startTime, endTime, place]);

  if (!isOpen || !place) return null;

  const handleConfirm = () => {
    onConfirm(selectedDayId, {
      plannedStart: startTime,
      plannedEnd: endTime,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-to-trip-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 id="add-to-trip-title" className="text-lg font-semibold text-slate-100">
              Add to Itinerary
            </h2>
            <p className="text-xs text-slate-400">
              AI assists. You choose the day and scheduled time slot.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Place Preview Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-slate-100 text-base">
                {place.name}
              </h3>
              <ProvenanceBadge provenance={place.provenance} />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Est. ~{durationMinutes} mins
              </span>
              <span>Category: {place.category}</span>
            </div>
          </div>

          {/* Form: Select Day */}
          <div className="space-y-1.5">
            <label
              htmlFor="day-select"
              className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Select Itinerary Day</span>
            </label>
            <select
              id="day-select"
              value={selectedDayId}
              onChange={(e) => setSelectedDayId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
            >
              {days.map((day) => (
                <option key={day.id} value={day.id}>
                  Day {day.dayNumber} ({day.date}) – {day.themeTitle}
                </option>
              ))}
            </select>
          </div>

          {/* Form: Select Start Time & Computed End Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="start-time-input"
                className="text-xs font-medium text-slate-300 flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Planned Start</span>
              </label>
              <input
                id="start-time-input"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Planned End</span>
              </label>
              <div className="w-full bg-slate-800/50 border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-slate-300">
                {endTime}
              </div>
            </div>
          </div>

          {/* Schedule Conflict Analysis Preview */}
          {conflictingItem ? (
            <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1 text-amber-200/90">
                <p className="font-semibold text-amber-300">
                  Time Slot Overlap Detected
                </p>
                <p>
                  Overlaps with &ldquo;{conflictingItem.title}&rdquo; (
                  {conflictingItem.timeSlot.plannedStart} &ndash;{' '}
                  {conflictingItem.timeSlot.plannedEnd}).
                </p>
                <p className="text-[11px] text-amber-300/80">
                  Adding this item will insert it at {startTime}. You can adjust
                  timings later using cascade resolution.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-3 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Fits cleanly into Day {selectedDay?.dayNumber} schedule without
                direct overlap.
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-800 bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950/40 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Confirm & Add to Day {selectedDay?.dayNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
