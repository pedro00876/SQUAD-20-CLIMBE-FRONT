import { cn } from '@/utils/cn';

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' }) {
  const variants = {
    default: 'bg-climbe-primary/10 text-climbe-primary border-climbe-primary/20',
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-tight border",
      variants[variant]
    )}>
      {children}
    </span>
  );
}
