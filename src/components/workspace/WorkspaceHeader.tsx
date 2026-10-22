import React from 'react';
import Link from 'next/link';
import { Trip } from '@/types/trip';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateDisplay } from '@/lib/utils';
import {
  Compass,
  FileDown,
  Sparkles,
  Users,
  IndianRupee,
  Calendar,
  Share2,
  HardDrive,
  Sliders,
} from 'lucide-react';

interface WorkspaceHeaderProps {
  trip: Trip;
  onOpenPdfModal: () => void;
  onOpenRealityCheck: () => void;
  onOpenExpenses: () => void;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  trip,
  onOpenPdfModal,
  onOpenRealityCheck,
  onOpenExpenses,
}) => {
  const totalSpent = trip.expenses.reduce((acc, exp) => acc + exp.amount, 0);
  const remainingBudget = trip.totalPlannedBudget - totalSpent;

  return (
    <header className="bg-white border-b border-canvas-200 px-4 sm:px-8 py-4 sticky top-0 z-30 shadow-subtle backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Brand + Trip Title & Metadata */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/"
            className="w-10 h-10 rounded-2xl bg-terracotta-500 text-white flex items-center justify-center shadow-warm hover:scale-105 transition-transform shrink-0"
            title="Return to Home"
          >
            <Compass className="w-5 h-5" />
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {trip.title}
              </h1>
              {trip.isGuest && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <HardDrive className="w-3 h-3 text-emerald-600" />
                  <span>Saved on this device</span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {formatDateDisplay(trip.startDate)} – {formatDateDisplay(trip.endDate)}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-forest-500" />
                <span>{trip.travelerCount} Travelers</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <IndianRupee className="w-3.5 h-3.5 text-terracotta-500" />
                <span>{formatCurrency(trip.budgetPerPerson)}/person</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Burn Summary & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Quick Expense / Burn Bar */}
          <div
            onClick={onOpenExpenses}
            className="cursor-pointer bg-canvas-50 hover:bg-canvas-100 border border-canvas-200 px-3 py-1.5 rounded-2xl flex items-center gap-2.5 transition-colors"
            title="Click to view and split expenses"
          >
            <div className="text-left text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Budget Spent
              </span>
              <span className="font-extrabold text-slate-900">
                {formatCurrency(totalSpent)}{' '}
                <span className="text-[10px] font-medium text-slate-500">
                  / {formatCurrency(trip.totalPlannedBudget)}
                </span>
              </span>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
              {Math.round((totalSpent / trip.totalPlannedBudget) * 100)}%
            </div>
          </div>

          {/* Reality Check / What-If Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenRealityCheck}
            className="rounded-xl gap-1.5"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Reality Check & What-If</span>
            <span className="sm:hidden">Check</span>
          </Button>

          {/* Export PDF Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={onOpenPdfModal}
            className="rounded-xl gap-1.5 px-4"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
