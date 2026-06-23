import { Check, Clock, AlertCircle, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { Tooltip } from './Tooltip';

export type ProcessStage =
  | 'CADASTRO'
  | 'REUNIAO'
  | 'PROPOSTA'
  | 'CONTRATO'
  | 'DOCUMENTACAO'
  | 'VALIDACAO'
  | 'FERRAMENTAS'
  | 'RELATORIO'
  | 'APROVACAO_FINAL'
  | 'CONCLUIDO';

// ─── Stage definitions ────────────────────────────────────────────────────────

interface StageConfig {
  id: ProcessStage;
  label: string;
  etapaKey: string;
}

const STAGES: StageConfig[] = [
  { id: 'CADASTRO',        label: 'Início',          etapaKey: 'E1' },
  { id: 'REUNIAO',         label: 'Reunião',          etapaKey: 'E2' },
  { id: 'PROPOSTA',        label: 'Proposta',         etapaKey: 'E2' },
  { id: 'CONTRATO',        label: 'Contrato',         etapaKey: 'E2' },
  { id: 'DOCUMENTACAO',    label: 'Documentação',     etapaKey: 'E3' },
  { id: 'VALIDACAO',       label: 'Validação',        etapaKey: 'E3' },
  { id: 'FERRAMENTAS',     label: 'Análise',          etapaKey: 'E4' },
  { id: 'RELATORIO',       label: 'Relatório',        etapaKey: 'E5' },
  { id: 'APROVACAO_FINAL', label: 'Aprovação Final',  etapaKey: 'E6' },
];

// Groups for top-bar labels
const ETAPA_GROUPS: { key: string; label: string; stageIds: ProcessStage[] }[] = [
  { key: 'E1', label: 'Início',        stageIds: ['CADASTRO'] },
  { key: 'E2', label: 'Comercial',     stageIds: ['REUNIAO', 'PROPOSTA', 'CONTRATO'] },
  { key: 'E3', label: 'Documentação',  stageIds: ['DOCUMENTACAO', 'VALIDACAO'] },
  { key: 'E4', label: 'Análise',       stageIds: ['FERRAMENTAS'] },
  { key: 'E5', label: 'Relatório',     stageIds: ['RELATORIO'] },
  { key: 'E6', label: 'Aprovação',     stageIds: ['APROVACAO_FINAL'] },
];

interface ProcessStepperProps {
  currentStage: ProcessStage;
  rejected?: boolean;
  /** If provided, highlights this stage as the "selected" view (for navigation). */
  selectedStage?: ProcessStage;
  /** Called when the user clicks a reachable stage circle. */
  onStageClick?: (stage: ProcessStage) => void;
}

export function ProcessStepper({
  currentStage,
  rejected = false,
  selectedStage,
  onStageClick,
}: ProcessStepperProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const isCompleted = currentStage === 'CONCLUIDO';
  const selectedIndex = selectedStage ? STAGES.findIndex(s => s.id === selectedStage) : currentIndex;

  const completedCount = isCompleted ? STAGES.length : currentIndex;
  const totalCount = STAGES.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Progresso geral
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest text-climbe-secondary">
          {completedCount} / {totalCount} etapas — {progressPct}%
        </span>
      </div>

      {/* Thin progress bar */}
      <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-climbe-primary transition-all duration-700 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Etapa group labels */}
      <div className="flex w-full">
        {ETAPA_GROUPS.map(group => {
          const groupStageIndexes = group.stageIds.map(sid =>
            STAGES.findIndex(s => s.id === sid),
          );
          const isGroupPast = isCompleted || groupStageIndexes.every(i => i < currentIndex);
          const isGroupCurrent = !isCompleted && groupStageIndexes.some(i => i === currentIndex);
          const stageSpan = group.stageIds.length;

          return (
            <div
              key={group.key}
              className="flex flex-col items-center"
              style={{ flex: stageSpan + (stageSpan - 1) * 0.25 }}
            >
              <span
                className={clsx(
                  'text-[9px] font-black uppercase tracking-widest transition-colors',
                  isGroupCurrent
                    ? rejected
                      ? 'text-red-500'
                      : 'text-climbe-primary'
                    : isGroupPast
                      ? 'text-climbe-secondary'
                      : 'text-gray-300',
                )}
              >
                {group.key}: {group.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Steps row */}
      <div className="w-full overflow-x-auto custom-scrollbar pb-6">
        <div className="flex items-center min-w-max px-2">
          {STAGES.map((stage, index) => {
            const isPast    = isCompleted || index < currentIndex;
            const isCurrent = !isCompleted && index === currentIndex;
            const isFuture  = !isCompleted && index > currentIndex;
            const isSelected = onStageClick && index === selectedIndex;
            const isClickable = !!onStageClick && (isPast || isCurrent);

            const tooltipText = isFuture
              ? `Etapa bloqueada — conclua as etapas anteriores para desbloquear "${stage.label}"`
              : isClickable
                ? `Ver etapa: ${stage.label}`
                : stage.label;

            return (
              <div key={stage.id} className="flex items-center">
                <Tooltip content={tooltipText} side="top">
                  <div
                    className="flex flex-col items-center"
                    style={{ cursor: isFuture ? 'not-allowed' : isClickable ? 'pointer' : 'default' }}
                    onClick={() => isClickable && onStageClick?.(stage.id)}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                        onStageClick?.(stage.id);
                      }
                    }}
                  >
                    {/* Circle */}
                    <div
                      className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10',
                        isPast && 'bg-climbe-primary border-climbe-primary text-climbe-secondary shadow-sm',
                        isCurrent && !rejected && 'bg-white border-climbe-primary text-climbe-primary shadow-[0_0_15px_rgba(206,255,26,0.6)]',
                        isCurrent && rejected && 'bg-white border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]',
                        isFuture && 'bg-gray-50 border-gray-200 text-gray-300',
                        // Selected ring for navigation
                        isSelected && !isCurrent && 'ring-2 ring-offset-2 ring-climbe-primary',
                      )}
                    >
                      {isPast ? (
                        <Check size={18} className="stroke-[3]" />
                      ) : isCurrent && rejected ? (
                        <AlertCircle size={18} className="stroke-[2.5]" />
                      ) : isCurrent ? (
                        <Clock size={18} className="stroke-[2.5] animate-pulse" />
                      ) : (
                        <Lock size={13} className="text-gray-300" />
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={clsx(
                        'absolute mt-12 text-[9px] font-black uppercase tracking-widest whitespace-nowrap text-center transition-colors',
                        (isPast || isCurrent) ? 'text-climbe-secondary' : 'text-gray-300',
                        isCurrent && rejected && 'text-red-500',
                        isSelected && !isCurrent && 'text-climbe-primary',
                      )}
                      style={{ position: 'relative', marginTop: '10px' }}
                    >
                      {stage.label}
                    </span>
                  </div>
                </Tooltip>

                {/* Connector line */}
                {index < STAGES.length - 1 && (
                  <div className="w-14 h-[2px] mx-1.5 relative shrink-0" style={{ marginBottom: '22px' }}>
                    <div className="absolute inset-0 bg-gray-200 rounded-full" />
                    <div
                      className={clsx(
                        'absolute inset-0 rounded-full transition-all duration-500',
                        isPast && !rejected ? 'bg-climbe-primary' : '',
                        isPast && rejected && index === currentIndex - 1 ? 'bg-red-400' : '',
                      )}
                      style={{ width: isPast ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
