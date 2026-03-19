import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-climbe-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
          {
            'bg-climbe-primary text-white shadow-lg shadow-climbe-primary/20 hover:bg-climbe-primary/90': variant === 'default',
            'bg-climbe-secondary text-white hover:bg-climbe-secondary/90': variant === 'secondary',
            'border-2 border-climbe-primary text-climbe-primary bg-transparent hover:bg-climbe-primary/5': variant === 'outline',
            'text-climbe-primary hover:bg-climbe-primary/5': variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-500/90': variant === 'danger',
            'h-12 px-6 py-3': size === 'default',
            'h-9 rounded-lg px-4 text-xs': size === 'sm',
            'h-14 rounded-2xl px-10 text-base': size === 'lg',
            'h-11 w-11 rounded-full': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
