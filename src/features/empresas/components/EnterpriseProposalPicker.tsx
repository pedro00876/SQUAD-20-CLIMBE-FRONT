import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronRight, FileText, User } from 'lucide-react';
import { StageBadge } from '@/components/ui/StageBadge';
import { getEnterpriseListStage } from '@/features/pipeline/utils/getEnterpriseListStage';
import { getProposalStatusLabel } from '@/features/workflow/labels';
import type { Proposal } from '@/services/proposal.service';

interface EnterpriseProposalPickerProps {
  proposals: Proposal[];
  onSelect: (proposalId: number) => void;
}

export function EnterpriseProposalPicker({ proposals, onSelect }: EnterpriseProposalPickerProps) {
  const sorted = [...proposals].sort((a, b) => b.id - a.id);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {sorted.map((proposal) => {
        const { stage, rejected } = getEnterpriseListStage(proposal);

        return (
          <button
            key={proposal.id}
            type="button"
            onClick={() => onSelect(proposal.id)}
            className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-gray-100 bg-white p-6 text-left shadow-sm transition-all hover:border-climbe-primary/30 hover:shadow-xl"
          >
            <div className="absolute right-0 top-0 -mr-12 -mt-12 h-24 w-24 rounded-full bg-climbe-primary/5 transition-transform duration-500 group-hover:scale-150" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-climbe-secondary text-sm font-black italic text-white shadow-lg">
                  <FileText size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-lg font-bold italic text-climbe-secondary">
                    Proposta #{proposal.id}
                  </h4>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {proposal.createdAt
                      ? format(new Date(proposal.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                      : '—'}
                  </p>
                  <p className="mt-2 text-xs font-medium text-gray-500">
                    {getProposalStatusLabel(proposal.status)}
                  </p>
                  {proposal.responsibleAnalystName && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                      <User size={12} />
                      {proposal.responsibleAnalystName}
                    </p>
                  )}
                </div>
              </div>

              <ChevronRight
                size={20}
                className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-climbe-primary"
              />
            </div>

            <div className="relative z-10 mt-4 flex items-center gap-2 border-t border-gray-50 pt-4">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Etapa</span>
              <StageBadge stage={stage} rejected={rejected} size="sm" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
