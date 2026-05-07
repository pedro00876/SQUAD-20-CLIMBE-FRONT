import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, subValue, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-climbe-primary/5 transition-all group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-climbe-primary/5 rounded-bl-[64px] transition-all group-hover:bg-climbe-primary/10" />
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-climbe-primary group-hover:text-climbe-secondary transition-colors">
          <Icon size={24} />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{title}</span>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold ${trend === 'up' ? 'text-green-500' : 'text-gray-400'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">{subValue}</span>
          </div>
        </div>
      </div>

      <div className="flex items-baseline gap-1">
        <h2 className="text-4xl font-black text-climbe-secondary italic tracking-tighter">{value}</h2>
      </div>
    </motion.div>
  );
}
