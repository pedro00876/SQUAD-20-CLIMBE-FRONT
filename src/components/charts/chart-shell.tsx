import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface ChartShellProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  inverse?: boolean;
}

export function ChartShell({
  eyebrow,
  title,
  description,
  children,
  className,
  inverse = false,
}: ChartShellProps) {
  return (
    <section
      className={cn(
        'rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm lg:p-8',
        className,
      )}
    >
      <header className="mb-6 flex flex-col gap-2">
        {eyebrow ? (
          <span
            className={cn(
              'text-[10px] font-black uppercase tracking-[0.24em] text-climbe-primary',
              inverse && 'text-climbe-primary',
            )}
          >
            {eyebrow}
          </span>
        ) : null}
        <div className="space-y-1">
          <h3
            className={cn(
              'text-xl font-black tracking-tight text-climbe-secondary italic',
              inverse && 'text-white',
            )}
          >
            {title}
          </h3>
          {description ? (
            <p className={cn('max-w-2xl text-sm text-gray-400', inverse && 'text-white/60')}>{description}</p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}
