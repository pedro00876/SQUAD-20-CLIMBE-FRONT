import type { ChartDatum } from '@/features/dashboard/data/demo-analytics';

interface LineChartProps {
  data: ChartDatum[];
}

export function LineChart({ data }: LineChartProps) {
  const width = 100;
  const height = 100;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const stepX = data.length > 1 ? width / (data.length - 1) : width;

  const points = data
    .map((item, index) => {
      const x = index * stepX;
      const y = height - (item.value / maxValue) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  return (
    <div className="space-y-5">
      <div className="rounded-[28px] bg-[#F4F7F8] p-4">
        <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#79C6C0" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#79C6C0" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <polyline fill="url(#lineFill)" points={areaPoints} />
          <polyline
            fill="none"
            points={points}
            stroke="#79C6C0"
            strokeWidth="2.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {data.map((item, index) => {
            const x = index * stepX;
            const y = height - (item.value / maxValue) * height;

            return (
              <g key={item.label}>
                <circle cx={x} cy={y} r="2.2" fill="#1E1F1C" />
                <circle cx={x} cy={y} r="1.2" fill="#79C6C0" />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {data.map((item) => (
          <div key={item.label} className="rounded-2xl bg-gray-50 px-3 py-2 text-center">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{item.label}</div>
            <div className="mt-1 text-sm font-black text-climbe-secondary">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
