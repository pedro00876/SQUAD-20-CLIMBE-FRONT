import type { ProposalStatus } from './types';

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  RECEIVED: 'Recebida',
  IN_TRIAGE: 'Em triagem',
  ELIGIBLE: 'Elegível',
  PENDING_ADJUSTMENTS: 'Aguardando ajustes',
  COMMERCIAL_PROPOSAL: 'Proposta comercial',
  COMMERCIAL_PROPOSAL_APPROVED: 'Proposta aprovada',
  COMMERCIAL_PROPOSAL_REJECTED: 'Proposta reprovada',
  READY_FOR_NEXT_STAGE: 'Próxima etapa',
  COMPLETED: 'Concluída',
};

export function getProposalStatusLabel(status?: string | null): string {
  if (!status) return '—';
  const key = status.toUpperCase() as ProposalStatus;
  return PROPOSAL_STATUS_LABELS[key] ?? status;
}
