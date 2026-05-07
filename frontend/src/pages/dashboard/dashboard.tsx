import { LayoutDashboard, FileText, Briefcase, Users, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RevenueChart, StatusPieChart } from '@/components/dashboard/DashboardCharts';
import { GoogleCalendar } from '@/components/dashboard/GoogleCalendar';
import { motion } from 'framer-motion';

export function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center gap-3 text-climbe-primary">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visão Geral</span>
        </div>
        <h1 className="text-4xl font-black text-climbe-secondary tracking-tighter italic">Dashboard</h1>
        <p className="text-gray-400 font-light max-w-2xl">
          Bem-vindo ao painel de controle. Aqui você tem uma visão completa de suas propostas, contratos e reuniões.
        </p>
      </motion.div>

      {/* Grid de Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Propostas" 
          value="124" 
          subValue="+12% este mês" 
          icon={FileText} 
          trend="up"
        />
        <StatCard 
          title="Contratos" 
          value="48" 
          subValue="8 novos este mês" 
          icon={Briefcase} 
          trend="up"
        />
        <StatCard 
          title="Clientes" 
          value="89" 
          subValue="+4 desde a semana passada" 
          icon={Users} 
          trend="neutral"
        />
        <StatCard 
          title="Receita" 
          value="R$ 45k" 
          subValue="+22% vs anterior" 
          icon={TrendingUp} 
          trend="up"
        />
      </div>

      {/* Middle Section: Charts + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Gráfico de Barras */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="font-bold text-climbe-secondary italic leading-tight">Fluxo de Propostas</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Volume Semestral</p>
          </div>
          <div className="flex-1 flex items-center">
            <RevenueChart />
          </div>
        </div>

        {/* Calendário Google (No Meio) */}
        <div className="lg:col-span-4 h-full">
          <GoogleCalendar />
        </div>

        {/* Gráfico de Pizza */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="font-bold text-climbe-secondary italic leading-tight">Distribuição de Status</h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">Performance de Conversão</p>
          </div>
          <div className="flex-1 flex items-center">
            <StatusPieChart />
          </div>
          <div className="mt-6 flex justify-around">
             <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-climbe-primary mb-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Ativas</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-gray-400 mb-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Pendentes</span>
             </div>
             <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-climbe-secondary mb-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase">Concluídas</span>
             </div>
          </div>
        </div>
      </div>

      {/* Tabela de Atividades */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <h3 className="font-bold text-climbe-secondary tracking-tight italic">Atividades Recentes</h3>
          <button className="text-xs text-climbe-primary font-bold hover:underline bg-climbe-primary/10 px-4 py-2 rounded-xl transition-all hover:bg-climbe-primary/20">
            Ver tudo
          </button>
        </div>
        <div className="p-8 space-y-6">
          {[
            { name: "Nova Proposta - Cliente ABC", time: "Há 2 horas", status: "PENDENTE", color: "bg-gray-100" },
            { name: "Contrato Assinado - Tech Corp", time: "Há 5 horas", status: "CONCLUÍDO", color: "bg-climbe-primary" },
            { name: "Reunião Agendada", time: "Há 1 dia", status: "AGENDADO", color: "bg-climbe-secondary text-white" }
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0 group cursor-pointer hover:bg-gray-50/50 -mx-4 px-4 rounded-2xl transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${activity.color} flex items-center justify-center font-black italic text-xs`}>
                  {activity.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-climbe-secondary italic truncate">{activity.name}</p>
                  <p className="text-[10px] text-gray-400">{activity.time}</p>
                </div>
              </div>
              <div className={`text-[8px] font-black px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest ${activity.status === 'CONCLUÍDO' ? 'bg-climbe-primary text-climbe-secondary' : 'bg-gray-50 text-gray-400'}`}>
                {activity.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

