import { Check, Clock, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

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

const STAGES = [
  { id: 'CADASTRO', label: 'Cadastro' },
  { id: 'REUNIAO', label: 'Reunião' },
  { id: 'PROPOSTA', label: 'Proposta' },
  { id: 'CONTRATO', label: 'Contrato' },
  { id: 'DOCUMENTACAO', label: 'Documentação' },
  { id: 'VALIDACAO', label: 'Validação' },
  { id: 'FERRAMENTAS', label: 'Ferramentas' },
  { id: 'RELATORIO', label: 'Relatório' },
  { id: 'APROVACAO_FINAL', label: 'Aprovação Final' },
];

interface ProcessStepperProps {
  currentStage: ProcessStage;
  rejected?: boolean;
}

export function ProcessStepper({ currentStage, rejected = false }: ProcessStepperProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage);
  const isCompleted = currentStage === 'CONCLUIDO';

  return (
    <div className="w-full py-6 overflow-x-auto custom-scrollbar">
      <div className="flex items-center min-w-max px-4">
        {STAGES.map((stage, index) => {
          const isPast = isCompleted || index < currentIndex;
          const isCurrent = !isCompleted && index === currentIndex;
          const isFuture = !isCompleted && index > currentIndex;

          return (
            <div key={stage.id} className="flex items-center">
              <div className="flex flex-col items-center relative">
                <div 
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10",
                    isPast && "bg-climbe-primary border-climbe-primary text-climbe-secondary",
                    isCurrent && !rejected && "bg-white border-climbe-primary text-climbe-primary shadow-[0_0_15px_rgba(206,255,26,0.5)]",
                    isCurrent && rejected && "bg-white border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]",
                    isFuture && "bg-gray-50 border-gray-200 text-gray-300"
                  )}
                >
                  {isPast ? (
                    <Check size={18} className="stroke-[3]" />
                  ) : isCurrent && rejected ? (
                    <AlertCircle size={18} className="stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock size={18} className="stroke-[2.5] animate-pulse" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <span 
                  className={clsx(
                    "absolute top-12 text-[10px] font-black uppercase tracking-widest whitespace-nowrap text-center transition-colors",
                    (isPast || isCurrent) ? "text-climbe-secondary" : "text-gray-300",
                    isCurrent && rejected && "text-red-500"
                  )}
                >
                  {stage.label}
                </span>
              </div>
              
              {index < STAGES.length - 1 && (
                <div className="w-16 h-[2px] mx-2 relative top-[-10px]">
                  <div className="absolute inset-0 bg-gray-200" />
                  <div 
                    className="absolute inset-0 bg-climbe-primary transition-all duration-500"
                    style={{ 
                      width: isPast ? '100%' : '0%',
                      opacity: isPast ? 1 : 0
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
