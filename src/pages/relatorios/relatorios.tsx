import { BarChart3 } from 'lucide-react';
import { BarChart } from '@/components/charts/bar-chart';
import { ChartShell } from '@/components/charts/chart-shell';
import { DonutChart } from '@/components/charts/donut-chart';
import { MetricCard } from '@/components/charts/metric-card';
import {
  kpiPerformanceData,
  reportsBreakdownData,
  reportsTrendData,
} from '@/features/dashboard/data/demo-analytics';

export function RelatoriosPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-climbe-primary">
          <BarChart3 size={20} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Análise</span>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-climbe-secondary italic">Relatórios</h1>
        <p className="max-w-2xl font-light text-gray-400">
          Visualize o desempenho das operações com indicadores consolidados, comparativos estratégicos e acompanhamento por área.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {kpiPerformanceData.map((item, index) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={`${item.value}%`}
            delta={index % 2 === 0 ? 'Meta acima' : 'Acompanhar'}
            tone={index % 2 === 0 ? 'positive' : 'neutral'}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.25fr_0.95fr]">
        <ChartShell
          eyebrow="Desempenho"
          title="Entrega semanal de relatórios"
          description="Visão consolidada para acompanhamento por período e comparação entre equipes."
          className="border-transparent bg-climbe-secondary text-white"
          inverse
        >
          <div className="space-y-6">
            <BarChart data={reportsTrendData} />
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-sm text-white/60">Total processado no ciclo demo</span>
              <strong className="text-2xl font-black text-climbe-primary">81 entregas</strong>
            </div>
          </div>
        </ChartShell>

        <ChartShell
          eyebrow="Cobertura"
          title="Distribuição por área"
          description="Acompanhe a participação de cada área no volume total de relatórios."
        >
          <DonutChart data={reportsBreakdownData} />
        </ChartShell>
      </div>

      <ChartShell
        eyebrow="Leitura rápida"
        title="Indicadores prioritários"
        description="Resumo executivo com os principais indicadores de acompanhamento."
      >
        <div className="space-y-4">
          {kpiPerformanceData.map((item) => (
            <div key={item.label} className="rounded-[24px] bg-gray-50 p-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <span className="font-semibold text-climbe-secondary">{item.label}</span>
                <span className="text-sm font-black text-climbe-primary">{item.value}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-climbe-primary transition-all duration-700"
                  style={{ width: `${item.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartShell>
    </div>
  );
}
