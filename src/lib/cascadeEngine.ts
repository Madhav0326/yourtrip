import {
  ItineraryItem,
  DayPlan,
  AffectedActivity,
  CascadeOption,
  CascadeConflictReport,
} from '@/types/trip';
import {
  parseMinutesFromTime,
  formatTimeFromMinutes,
  addMinutesToTime,
  formatTimeDisplay,
} from './utils';

/**
 * Pure domain engine for detecting itinerary schedule conflicts
 * and proposing transparent, user-controlled cascade options.
 * 
 * CORE PRINCIPLE: NEVER SILENTLY OVERWRITE.
 */

export interface SimulationResult {
  newItems: ItineraryItem[];
  shiftedMinutes: number;
  explanation: string;
}

export function detectDownstreamConflicts(
  day: DayPlan,
  triggerItemId: string,
  newStartTime: string,
  newDurationMinutes?: number
): CascadeConflictReport {
  const items = [...day.items].sort((a, b) => a.order - b.order);
  const triggerIdx = items.findIndex((i) => i.id === triggerItemId);

  if (triggerIdx === -1) {
    return {
      triggerItemId,
      delayMinutes: 0,
      affectedCount: 0,
      affectedItems: [],
      options: [],
    };
  }

  const triggerItem = items[triggerIdx];
  const originalStartM = parseMinutesFromTime(triggerItem.timeSlot.plannedStart);
  const newStartM = parseMinutesFromTime(newStartTime);
  const durationM = newDurationMinutes ?? triggerItem.durationMinutes;
  const newEndM = newStartM + durationM;
  const delayMinutes = newStartM - originalStartM;

  const affectedItems: AffectedActivity[] = [];
  let currentRunningTime = newEndM;

  // Scan downstream activities
  for (let i = triggerIdx + 1; i < items.length; i++) {
    const item = items[i];
    const itemOrigStartM = parseMinutesFromTime(item.timeSlot.plannedStart);
    const travelTimeM = item.travelFromPrevious?.durationMinutes || 15;
    const earliestPossibleStart = currentRunningTime + travelTimeM;

    if (earliestPossibleStart > itemOrigStartM) {
      // Overlap detected!
      const overlapMinutes = earliestPossibleStart - itemOrigStartM;
      const proposedStartM = itemOrigStartM + overlapMinutes;
      const proposedEndM = proposedStartM + item.durationMinutes;

      let conflictType: AffectedActivity['conflictType'] = 'OVERLAP';
      let description = `Pushed back by ${overlapMinutes} mins due to previous delay.`;

      // Check closing hours if known (e.g. 18:00 = 1080)
      if (item.location.openingHours && proposedEndM > 18 * 60) {
        conflictType = 'CLOSING_HOURS';
        description += ` Caution: May clash with closing hours (${item.location.openingHours}).`;
      } else if (proposedEndM > 19 * 60) {
        conflictType = 'PAST_SUNSET';
        description += ` Activity will finish after sunset (${formatTimeDisplay(formatTimeFromMinutes(proposedEndM))}).`;
      }

      affectedItems.push({
        item,
        dayNumber: day.dayNumber,
        originalStart: item.timeSlot.plannedStart,
        originalEnd: item.timeSlot.plannedEnd,
        proposedStart: formatTimeFromMinutes(proposedStartM),
        proposedEnd: formatTimeFromMinutes(proposedEndM),
        conflictType,
        description,
      });

      // Update running cursor for the next iteration
      currentRunningTime = proposedEndM;
    } else {
      // No overlap for this item, but travel buffer is fine
      currentRunningTime = parseMinutesFromTime(item.timeSlot.plannedEnd);
    }
  }

  // Construct explicit resolution options
  const options: CascadeOption[] = [];

  if (affectedItems.length > 0) {
    // Option A: Shift all subsequent activities forward
    options.push({
      id: 'SHIFT_DOWNSTREAM',
      title: 'Shift downstream activities',
      description: `Automatically shift ${affectedItems.length} subsequent ${
        affectedItems.length === 1 ? 'activity' : 'activities'
      } to maintain travel buffers and visit durations.`,
      impactSummary: `Preserves all activities. Day concludes at ${
        affectedItems[affectedItems.length - 1].proposedEnd
      }.`,
      confidenceScore: 90,
      apply: () => {},
    });

    // Option B: Shorten the delayed activity
    const allowableDuration = Math.max(
      30,
      (parseMinutesFromTime(items[triggerIdx + 1].timeSlot.plannedStart) -
        (items[triggerIdx + 1].travelFromPrevious?.durationMinutes || 15)) -
        newStartM
    );

    if (allowableDuration >= 30) {
      options.push({
        id: 'SHORTEN_DELAYED',
        title: `Shorten ${triggerItem.title} to ${allowableDuration} mins`,
        description: `Reduce visit time so subsequent activities start at their original scheduled times.`,
        impactSummary: `Subsequent ${affectedItems.length} activities remain unaffected.`,
        confidenceScore: 75,
        apply: () => {},
      });
    }

    // Option C: Move last conflicting activity to next day
    const lastConflicting = affectedItems[affectedItems.length - 1];
    options.push({
      id: 'MOVE_TO_NEXT_DAY',
      title: `Reschedule "${lastConflicting.item.title}" to Tomorrow`,
      description: `Free up time this evening to keep a relaxed pace without rushing.`,
      impactSummary: `Lightens Day ${day.dayNumber} schedule. Adds activity to Day ${day.dayNumber + 1}.`,
      confidenceScore: 80,
      apply: () => {},
    });

    // Option D: Skip an intermediate activity
    options.push({
      id: 'SKIP_INTERMEDIATE',
      title: `Skip "${affectedItems[0].item.title}"`,
      description: `Bypass this stop to absorb the delay and stay on track for the rest of the day.`,
      impactSummary: `Saves travel and visit time; restores original schedule for remaining activities.`,
      confidenceScore: 65,
      apply: () => {},
    });
  }

  return {
    triggerItemId,
    delayMinutes,
    affectedCount: affectedItems.length,
    affectedItems,
    options,
  };
}

/**
 * Generates an updated DayPlan applying Option A: Shift Downstream
 */
export function applyShiftDownstream(
  day: DayPlan,
  triggerItemId: string,
  newStartTime: string
): DayPlan {
  const items = [...day.items].sort((a, b) => a.order - b.order);
  const triggerIdx = items.findIndex((i) => i.id === triggerItemId);
  if (triggerIdx === -1) return day;

  const updatedItems = [...items];
  const triggerItem = updatedItems[triggerIdx];
  const duration = triggerItem.durationMinutes;

  triggerItem.timeSlot = {
    ...triggerItem.timeSlot,
    actualStart: newStartTime,
    actualEnd: addMinutesToTime(newStartTime, duration),
  };
  triggerItem.status = 'DELAYED';

  let runningEndM = parseMinutesFromTime(triggerItem.timeSlot.actualEnd || triggerItem.timeSlot.plannedEnd);

  for (let i = triggerIdx + 1; i < updatedItems.length; i++) {
    const item = updatedItems[i];
    const travelTimeM = item.travelFromPrevious?.durationMinutes || 15;
    const itemStartM = runningEndM + travelTimeM;
    const itemEndM = itemStartM + item.durationMinutes;

    item.timeSlot = {
      ...item.timeSlot,
      actualStart: formatTimeFromMinutes(itemStartM),
      actualEnd: formatTimeFromMinutes(itemEndM),
    };
    item.status = 'DELAYED';

    runningEndM = itemEndM;
  }

  return {
    ...day,
    items: updatedItems,
  };
}

/**
 * Generates an updated DayPlan applying Option B: Shorten Delayed Activity
 */
export function applyShortenDelayed(
  day: DayPlan,
  triggerItemId: string,
  newStartTime: string,
  shortenedDurationMinutes: number
): DayPlan {
  const items = day.items.map((item) => {
    if (item.id === triggerItemId) {
      return {
        ...item,
        durationMinutes: shortenedDurationMinutes,
        timeSlot: {
          ...item.timeSlot,
          plannedStart: newStartTime,
          plannedEnd: addMinutesToTime(newStartTime, shortenedDurationMinutes),
          actualStart: newStartTime,
        },
        status: 'DELAYED' as const,
      };
    }
    return item;
  });

  return {
    ...day,
    items,
  };
}
