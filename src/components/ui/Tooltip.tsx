import { useState } from 'react';
import { clsx } from 'clsx';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, side = 'top', className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positionClass = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <div
      className={clsx('relative inline-flex', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          className={clsx(
            'absolute z-50 w-max max-w-[220px] rounded-xl bg-climbe-secondary text-white text-[10px] font-bold px-3 py-2 shadow-xl pointer-events-none',
            positionClass,
          )}
        >
          {content}
          {/* Arrow */}
          <div
            className={clsx(
              'absolute w-2 h-2 bg-climbe-secondary rotate-45',
              side === 'top' && 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
              side === 'bottom' && 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
              side === 'left' && 'left-full top-1/2 -translate-y-1/2 -translate-x-1/2',
              side === 'right' && 'right-full top-1/2 -translate-y-1/2 translate-x-1/2',
            )}
          />
        </div>
      )}
    </div>
  );
}

// Convenience wrapper that disables a button and shows tooltip when condition is true
interface DisabledWithTooltipProps {
  disabled: boolean;
  tooltip: string;
  children: React.ReactNode;
  className?: string;
}

export function DisabledWithTooltip({ disabled, tooltip, children, className }: DisabledWithTooltipProps) {
  if (!disabled) return <>{children}</>;
  return (
    <Tooltip content={tooltip} className={className}>
      <div className="cursor-not-allowed opacity-50 pointer-events-none select-none">
        {children}
      </div>
    </Tooltip>
  );
}
