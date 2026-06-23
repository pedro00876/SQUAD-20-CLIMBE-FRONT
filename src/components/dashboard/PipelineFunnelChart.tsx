import { STAGE_LABELS } from '@/features/pipeline/utils/deriveStage';
import type { ProcessStage } from '@/components/ui/ProcessStepper';

interface FunnelData {
  stage: ProcessStage | 'CONCLUIDO';
  count: number;
}

interface PipelineFunnelChartProps {
  data: FunnelData[];
}

const STAGE_ORDER: (ProcessStage | 'CONCLUIDO')[] = [
  'CADASTRO', 'REUNIAO', 'PROPOSTA', 'CONTRATO',
  'DOCUMENTACAO', 'VALIDACAO', 'FERRAMENTAS', 'RELATORIO',
  'APROVACAO_FINAL', 'CONCLUIDO',
];

const STAGE_COLORS: Partial<Record<ProcessStage | 'CONCLUIDO', string>> = {
  CADASTRO:        'bg-gray-300',
  REUNIAO:         'bg-blue-400',
  PROPOSTA:        'bg-violet-400',
  CONTRATO:        'bg-indigo-400',
  DOCUMENTACAO:    'bg-amber-400',
  VALIDACAO:       'bg-orange-400',
  FERRAMENTAS:     'bg-cyan-400',
  RELATORIO:       'bg-teal-400',
  APROVACAO_FINAL: 'bg-climbe-primary',
  CONCLUIDO:       'bg-green-500',
};

export function PipelineFunnelChart({ data }: PipelineFunnelChartProps) {
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const sorted = STAGE_ORDER
    .map(stage => data.find(d => d.stage === stage) ?? { stage, count: 0 })
    .filter(d => d.count > 0 || d.stage === 'CADASTRO');

  if (sorted.every(d => d.count === 0)) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-300 font-bold">
        Nenhuma empresa no pipeline
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {sorted.map(({ stage, count }) => {
        const pct = Math.max((count / maxCount) * 100, count > 0 ? 8 : 0);
        const colorClass = STAGE_COLORS[stage] ?? 'bg-gray-300';
        return (
          <div key={stage} className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 w-28 shrink-0 truncate">
              {STAGE_LABELS[stage]}
            </span>
            <div className="flex-1 h-5 bg-gray-50 rounded-full overflow-hidden">
              <div
                className={`h-full ${colorClass} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-black text-climbe-secondary w-5 text-right shrink-0">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
