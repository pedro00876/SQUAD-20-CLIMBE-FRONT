import { clsx } from 'clsx';

export interface FilterChip<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface FilterChipsProps<T extends string> {
  chips: FilterChip<T>[];
  active: T;
  onChange: (value: T) => void;
  className?: string;
}

export function FilterChips<T extends string>({ chips, active, onChange, className }: FilterChipsProps<T>) {
  return (
    <div className={clsx('flex flex-wrap gap-2', className)}>
      {chips.map(chip => (
        <button
          key={chip.value}
          onClick={() => onChange(chip.value)}
          className={clsx(
            'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border',
            active === chip.value
              ? 'bg-climbe-primary text-climbe-secondary border-climbe-primary shadow-sm'
              : 'bg-white text-gray-500 border-gray-200 hover:border-climbe-primary/40 hover:text-climbe-secondary',
          )}
        >
          {chip.label}
          {chip.count !== undefined && (
            <span
              className={clsx(
                'rounded-full px-1.5 py-0.5 text-[9px] font-black',
                active === chip.value ? 'bg-climbe-secondary/20' : 'bg-gray-100',
              )}
            >
              {chip.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
