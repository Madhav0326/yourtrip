import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  selected?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  selected = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-3xl p-5 border border-canvas-200 shadow-warm transition-all duration-200',
        hoverable && 'hover:shadow-elevated hover:border-canvas-300 hover:-translate-y-0.5 cursor-pointer',
        selected && 'border-terracotta-500 ring-2 ring-terracotta-200 shadow-elevated',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
