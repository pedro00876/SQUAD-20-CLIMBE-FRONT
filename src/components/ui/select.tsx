import React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'flex h-12 w-full rounded-2xl border px-5 py-3 pr-10 text-sm bg-slate-100/60 text-slate-900 border-slate-300 outline-none transition-all appearance-none cursor-pointer',
            'dark:bg-zinc-900/80 dark:text-white dark:border-zinc-700/60',
            'focus:outline-none focus:ring-4 focus:ring-climbe-primary/10 focus:border-climbe-primary/40',
            {
              'border-danger/30 bg-danger/5 text-danger focus:border-danger focus:ring-danger/10': error,
            },
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
          <ChevronDown size={16} />
        </div>
      </div>
    );
  }
);
Select.displayName = 'Select';
