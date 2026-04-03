import { cn } from '@/utils/cn';

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div className={cn(
      "h-10 w-10 rounded-xl bg-climbe-primary/10 border border-climbe-primary/20 flex items-center justify-center text-climbe-primary font-bold text-sm tracking-tighter",
      className
    )}>
      {initials}
    </div>
  );
}

