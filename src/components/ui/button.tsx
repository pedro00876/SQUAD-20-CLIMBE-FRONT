import React from 'react';
import { cn } from '@/utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-climbe-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
          {
            // Default (Primary) - Climbe primary (#79C6C0)
            'bg-climbe-primary text-climbe-secondary shadow-md shadow-climbe-primary/10 hover:bg-climbe-primary/95 hover:shadow-lg hover:shadow-climbe-primary/20': variant === 'default',
            // Secondary
            'bg-climbe-secondary text-white hover:bg-climbe-secondary/90': variant === 'secondary',
            // Outline
            'border-2 border-climbe-primary/30 text-climbe-primary bg-transparent hover:bg-climbe-primary/5 hover:border-climbe-primary': variant === 'outline',
            // Ghost
            'text-climbe-primary hover:bg-climbe-primary/5': variant === 'ghost',
            // Danger
            'bg-danger text-white hover:bg-danger/90 shadow-md shadow-danger/10 hover:shadow-lg': variant === 'danger',
            // Success
            'bg-success text-white hover:bg-success/90 shadow-md shadow-success/10 hover:shadow-lg': variant === 'success',
            
            // Sizes
            'h-12 px-6 py-3': size === 'default',
            'h-9 rounded-xl px-4 text-[10px]': size === 'sm',
            'h-14 rounded-3xl px-10 text-sm': size === 'lg',
            'h-11 w-11 rounded-full p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-1 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
