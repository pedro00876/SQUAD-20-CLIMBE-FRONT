import { clsx } from 'clsx';
import type { ProcessStage } from './ProcessStepper';
import { STAGE_LABELS } from '@/features/pipeline/utils/deriveStage';

interface StageBadgeProps {
  stage: ProcessStage | 'CONCLUIDO';
  rejected?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

const STAGE_COLORS: Record<ProcessStage | 'CONCLUIDO', string> = {
  CADASTRO:        'bg-gray-100 text-gray-500 border-gray-200',
  REUNIAO:         'bg-blue-50 text-blue-600 border-blue-200',
  PROPOSTA:        'bg-violet-50 text-violet-600 border-violet-200',
  CONTRATO:        'bg-indigo-50 text-indigo-600 border-indigo-200',
  DOCUMENTACAO:    'bg-amber-50 text-amber-600 border-amber-200',
  VALIDACAO:       'bg-orange-50 text-orange-600 border-orange-200',
  FERRAMENTAS:     'bg-cyan-50 text-cyan-600 border-cyan-200',
  RELATORIO:       'bg-teal-50 text-teal-600 border-teal-200',
  APROVACAO_FINAL: 'bg-green-50 text-green-700 border-green-200',
  CONCLUIDO:       'bg-green-100 text-green-700 border-green-300',
};

export function StageBadge({ stage, rejected = false, size = 'sm', className }: StageBadgeProps) {
  const colorClass = rejected
    ? 'bg-red-50 text-red-500 border-red-200'
    : STAGE_COLORS[stage] ?? 'bg-gray-100 text-gray-500 border-gray-200';

  const label = rejected ? `${STAGE_LABELS[stage]} · Reprovado` : STAGE_LABELS[stage];

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-black uppercase tracking-widest',
        size === 'sm' ? 'px-2.5 py-0.5 text-[9px]' : 'px-3 py-1 text-[10px]',
        colorClass,
        className,
      )}
    >
      {label}
    </span>
  );
}
