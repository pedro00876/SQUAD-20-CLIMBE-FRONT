import type { ChartDatum } from '@/features/dashboard/data/demo-analytics';

interface BarChartProps {
  data: ChartDatum[];
  highlightIndex?: number;
  minHeight?: number;
}

export function BarChart({ data, highlightIndex = data.length - 1, minHeight = 160 }: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3" style={{ minHeight }}>
        {data.map((item, index) => {
          const height = `${Math.max((item.value / maxValue) * 100, 8)}%`;

          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
              <span className="text-xs font-semibold text-gray-400">{item.value}</span>
              <div className="flex h-full w-full items-end rounded-[24px] bg-[#F4F7F8] p-2">
                <div
                  className={`w-full rounded-[18px] transition-all duration-700 ${
                    index === highlightIndex
                      ? 'bg-climbe-primary shadow-lg shadow-climbe-primary/20'
                      : 'bg-climbe-secondary/10'
                  }`}
                  style={{ height }}
                />
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
