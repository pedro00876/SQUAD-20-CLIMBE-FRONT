import type { ChartDatum } from '@/features/dashboard/data/demo-analytics';

interface DonutChartProps {
  data: ChartDatum[];
}

const segmentColors = ['#79C6C0', '#1E1F1C', '#A7D9D5', '#DCEEEE', '#8AA6A3'];

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 42;
  let offset = 0;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-52 w-52">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="42" fill="none" stroke="#EEF4F5" strokeWidth="14" />
          {data.map((item, index) => {
            const slice = (item.value / total) * circumference;
            const dashOffset = -offset;
            offset += slice;

            return (
              <circle
                key={item.label}
                cx="60"
                cy="60"
                r="42"
                fill="none"
                stroke={segmentColors[index % segmentColors.length]}
                strokeWidth="14"
                strokeDasharray={`${slice} ${circumference - slice}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Base demo</span>
          <strong className="text-3xl font-black text-climbe-secondary">{total}%</strong>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {data.map((item, index) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: segmentColors[index % segmentColors.length] }}
              />
              <span className="font-semibold text-climbe-secondary">{item.label}</span>
            </div>
            <span className="text-sm font-black text-gray-500">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
