import React from 'react';
import { DayPlan } from '@/types/trip';
import { formatDateDisplay } from '@/lib/utils';
import { Calendar } from 'lucide-react';

interface DaySelectorProps {
  days: DayPlan[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  activeDayIndex,
  onSelectDay,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {days.map((day, index) => {
        const isActive = index === activeDayIndex;
        return (
          <button
            key={day.id}
            onClick={() => onSelectDay(index)}
            className={`shrink-0 px-4 py-2.5 rounded-2xl text-left transition-all border ${
              isActive
                ? 'bg-terracotta-500 text-white border-terracotta-500 shadow-warm font-semibold'
                : 'bg-white text-slate-700 border-canvas-200 hover:border-canvas-300 hover:bg-canvas-50'
            }`}
          >
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold opacity-80">
              <Calendar className="w-3 h-3" />
              <span>Day {day.dayNumber}</span>
            </div>
            <div className="text-sm font-bold truncate max-w-[140px] mt-0.5">
              {formatDateDisplay(day.date)}
            </div>
          </button>
        );
      })}
    </div>
  );
};
