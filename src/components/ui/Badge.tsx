import React from 'react';
import { cn } from '@/lib/utils';
import { ActivityCategory } from '@/types/trip';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'danger' | 'category';
  category?: ActivityCategory;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  category,
  ...props
}) => {
  const categoryStyles: Record<ActivityCategory, string> = {
    ATTRACTION: 'bg-amber-50 text-amber-800 border-amber-200',
    FOOD: 'bg-orange-50 text-orange-800 border-orange-200',
    BEACH: 'bg-sky-50 text-sky-800 border-sky-200',
    NATURE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    CULTURE: 'bg-purple-50 text-purple-800 border-purple-200',
    SHOPPING: 'bg-rose-50 text-rose-800 border-rose-200',
    NIGHTLIFE: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    RELAX: 'bg-teal-50 text-teal-800 border-teal-200',
    TRAVEL: 'bg-slate-100 text-slate-800 border-slate-200',
  };

  const variants = {
    default: 'bg-canvas-200 text-slate-800 border-canvas-300',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200',
    category: category ? categoryStyles[category] : 'bg-slate-100 text-slate-800 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
