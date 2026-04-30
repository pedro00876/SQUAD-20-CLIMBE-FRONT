import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Fev', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Abr', value: 800 },
  { name: 'Mai', value: 500 },
  { name: 'Jun', value: 700 },
];

const pieData = [
  { name: 'Ativas', value: 45, color: '#00FF00' },
  { name: 'Pendentes', value: 25, color: '#888888' },
  { name: 'Concluídas', value: 30, color: '#111111' },
];

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} 
          />
          <Tooltip 
            cursor={{ fill: '#f9fafb' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Bar 
            dataKey="value" 
            fill="#00FF00" 
            radius={[6, 6, 0, 0]} 
            barSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusPieChart() {
  return (
    <div className="h-[300px] w-full relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-black text-climbe-secondary italic">100%</span>
        <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Performance</span>
      </div>
    </div>
  );
}
