import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber' | 'emerald';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-warm hover:shadow-kinetic focus:ring-terracotta-400 active:scale-[0.98]',
      secondary: 'bg-canvas-200 hover:bg-canvas-300 text-slate-900 border border-canvas-300 active:scale-[0.98]',
      outline: 'bg-transparent border border-slate-300 hover:border-terracotta-500 hover:text-terracotta-600 text-slate-700 active:scale-[0.98]',
      ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900',
      amber: 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm active:scale-[0.98]',
      emerald: 'bg-forest-500 hover:bg-forest-600 text-white shadow-sm active:scale-[0.98]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-xl font-medium',
      md: 'px-4 py-2 text-sm rounded-2xl font-medium',
      lg: 'px-6 py-3 text-base rounded-2xl font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
