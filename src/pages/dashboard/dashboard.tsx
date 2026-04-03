import { ArrowRight, LayoutDashboard } from 'lucide-react';
import { BarChart } from '@/components/charts/bar-chart';
import { ChartShell } from '@/components/charts/chart-shell';
import { DonutChart } from '@/components/charts/donut-chart';
import { LineChart } from '@/components/charts/line-chart';
import { MetricCard } from '@/components/charts/metric-card';
import {
  dashboardMetrics,
  monthlyRevenueData,
  pipelineData,
  serviceDistributionData,
  weeklyAgendaData,
} from '@/features/dashboard/data/demo-analytics';

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <LayoutDashboard size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Visão Geral</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-climbe-secondary italic">Dashboard</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Acompanhe os principais indicadores operacionais, a evolução das atividades e a distribuição dos processos em um único painel executivo.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.35fr_0.95fr]">
        <ChartShell
          eyebrow="Fluxo da operação"
          title="Pipeline de contratos"
          description="Leitura inicial do fluxo comercial. Cada etapa pode ser substituída futuramente por dados reais do backend."
        >
          <BarChart data={pipelineData} />
        </ChartShell>

        <ChartShell
          eyebrow="Distribuição"
          title="Serviços mais acionados"
          description="Visão percentual por linha de serviço, ideal para validar o espaço de BI antes da integração completa."
        >
          <DonutChart data={serviceDistributionData} />
        </ChartShell>
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <ChartShell
          eyebrow="Tendência"
          title="Evolução mensal"
          description="Curva de referência para crescimento de receita ou entregas."
        >
          <LineChart data={monthlyRevenueData} />
        </ChartShell>

        <ChartShell
          eyebrow="Agenda"
          title="Atividades recentes"
          description="Acompanhe os eventos mais recentes e o status das atividades em andamento."
        >
          <div className="space-y-4">
            {weeklyAgendaData.map((item) => (
              <article
                key={item.title}
                className="flex items-start justify-between gap-4 rounded-[24px] border border-gray-100 bg-[#F8FAFC] px-5 py-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-climbe-secondary">{item.title}</h4>
                  <p className="text-sm text-gray-400">{item.subtitle}</p>
                </div>
                <div className="flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-climbe-primary shadow-sm">
                  {item.status}
                  <ArrowRight size={14} />
                </div>
              </article>
            ))}
          </div>
        </ChartShell>
      </div>

    </div>
  );
}
