import type { ProcessStage } from '@/components/ui/ProcessStepper';
import { isTerminalProposalStatus } from './deriveStage';

/** Stage badge for empresa list — uses proposal.status only (no contract/docs context). */
export function getEnterpriseListStage(
  proposal: { status?: string } | null,
): { stage: ProcessStage | 'CONCLUIDO'; rejected: boolean } {
  if (!proposal?.status) {
    return { stage: 'CADASTRO', rejected: false };
  }

  const status = proposal.status.toUpperCase();

  if (isTerminalProposalStatus(status)) {
    return { stage: 'CONCLUIDO', rejected: false };
  }

  if (['RECEIVED', 'IN_TRIAGE', 'PENDING_ADJUSTMENTS'].includes(status)) {
    return { stage: 'REUNIAO', rejected: false };
  }

  if (status === 'ELIGIBLE' || status === 'COMMERCIAL_PROPOSAL') {
    return { stage: 'PROPOSTA', rejected: false };
  }

  if (status === 'COMMERCIAL_PROPOSAL_REJECTED') {
    return { stage: 'PROPOSTA', rejected: true };
  }

  if (status === 'COMMERCIAL_PROPOSAL_APPROVED') {
    return { stage: 'CONTRATO', rejected: false };
  }

  if (status === 'READY_FOR_NEXT_STAGE') {
    return { stage: 'FERRAMENTAS', rejected: false };
  }

  return { stage: 'CADASTRO', rejected: false };
}
