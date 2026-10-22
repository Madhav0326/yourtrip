import React from 'react';
import { DataProvenance } from '@/types/trip';
import { cn } from '@/lib/utils';
import { Sparkles, Activity, Calculator, UserCheck, HelpCircle } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance: DataProvenance;
  label?: string;
  className?: string;
  showIcon?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  label,
  className,
  showIcon = true,
}) => {
  const configs: Record<
    DataProvenance,
    { text: string; bg: string; textCol: string; border: string; icon: React.ReactNode }
  > = {
    LIVE: {
      text: 'Live Data',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      textCol: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />,
    },
    ESTIMATED: {
      text: 'Estimated',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      textCol: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800',
      icon: <Calculator className="w-3 h-3 text-amber-600" />,
    },
    AI_RECOMMENDED: {
      text: 'AI Recommended',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      textCol: 'text-indigo-700 dark:text-indigo-300',
      border: 'border-indigo-200 dark:border-indigo-800',
      icon: <Sparkles className="w-3 h-3 text-indigo-600" />,
    },
    USER_ENTERED: {
      text: 'You Entered',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      textCol: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      icon: <UserCheck className="w-3 h-3 text-purple-600" />,
    },
    UNAVAILABLE: {
      text: 'Unavailable',
      bg: 'bg-slate-100 dark:bg-slate-800',
      textCol: 'text-slate-600 dark:text-slate-400',
      border: 'border-slate-200 dark:border-slate-700',
      icon: <HelpCircle className="w-3 h-3 text-slate-500" />,
    },
  };

  const config = configs[provenance] || configs.ESTIMATED;

  return (
    <span
      title={`Data reliability: ${config.text}`}
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border tracking-wide uppercase shadow-2xs',
        config.bg,
        config.textCol,
        config.border,
        className
      )}
    >
      {showIcon && config.icon}
      <span>{label || config.text}</span>
    </span>
  );
};
