import { cn } from '@/utils/cn';

interface MetricCardProps {
  label: string;
  value: string;
  delta: string;
  tone?: 'positive' | 'neutral' | 'warning';
}

const toneMap = {
  positive: 'bg-emerald-50 text-emerald-600',
  neutral: 'bg-cyan-50 text-cyan-700',
  warning: 'bg-amber-50 text-amber-700',
};

export function MetricCard({ label, value, delta, tone = 'neutral' }: MetricCardProps) {
  return (
    <article className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className={cn('rounded-full px-3 py-1 text-xs font-bold', toneMap[tone])}>{delta}</span>
      </div>
      <strong className="text-4xl font-black tracking-tight text-climbe-secondary">{value}</strong>
    </article>
  );
}
