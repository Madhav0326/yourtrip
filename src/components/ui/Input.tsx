import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full px-4 py-2.5 bg-canvas-50 text-slate-900 border border-canvas-300 rounded-2xl text-sm font-medium transition-all duration-150',
              'focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white focus:border-terracotta-400',
              'placeholder:text-slate-400',
              icon && 'pl-10',
              error && 'border-rose-400 focus:ring-rose-300',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
