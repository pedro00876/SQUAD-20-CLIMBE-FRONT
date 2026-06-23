import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, success, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full rounded-2xl border px-5 py-3 text-sm font-light transition-all',
          'placeholder:font-normal placeholder:text-gray-400/40',
          'bg-slate-100/60 border-slate-300 dark:bg-zinc-900/80 dark:border-zinc-700/60 dark:text-white dark:placeholder:text-zinc-500/40',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-slate-900 dark:file:text-white',
          'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          {
            'focus:bg-white focus:border-climbe-primary/40 focus:ring-4 focus:ring-climbe-primary/10 dark:focus:bg-zinc-900': !error && !success,
            'border-danger/30 bg-danger/5 text-danger placeholder:text-danger/40 focus:bg-white focus:border-danger focus:ring-4 focus:ring-danger/10 dark:focus:bg-zinc-900': error,
            'border-success/30 bg-success/5 text-success placeholder:text-success/40 focus:bg-white focus:border-success focus:ring-4 focus:ring-success/10 dark:focus:bg-zinc-900': success,
          },
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
