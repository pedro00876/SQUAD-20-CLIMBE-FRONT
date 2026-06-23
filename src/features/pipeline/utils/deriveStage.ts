import type { ProcessStage } from '@/components/ui/ProcessStepper';
import type { Contract } from '@/features/contracts/types';

export interface DeriveStageResult {
  stage: ProcessStage;
  rejected: boolean;
  pendingSignature?: boolean;
}

function isContractSigned(contract: Contract | null | undefined): boolean {
  return contract?.status?.toUpperCase() === 'DIGITALLY_SIGNED';
}

export function hasPrimeiraDataMeeting(meetings: { title?: string }[]): boolean {
  return meetings.some((m) => (m.title ?? '').toLowerCase().includes('primeira data'));
}

export function hasFinalPresentationMeeting(meetings: { title?: string }[]): boolean {
  return meetings.some((m) => (m.title ?? '').toLowerCase().includes('apresentação final'));
}

export function isTerminalProposalStatus(status?: string | null): boolean {
  const s = (status ?? '').toUpperCase();
  return s === 'COMPLETED' || s === 'HOMOLOGATED' || s === 'CONCLUIDO';
}

/**
 * Derives the current pipeline stage from proposal + contract + doc state.
 */
export function deriveStage(
  proposal: { status?: string } | null,
  contract: Contract | null | undefined,
  docRequirements: { status?: string }[],
  reports: unknown[],
  meetings: { title?: string }[],
): DeriveStageResult {
  if (!proposal) return { stage: 'CADASTRO', rejected: false };

  const status = (proposal.status ?? '').toUpperCase();

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
    if (!contract || !isContractSigned(contract)) {
      return { stage: 'CONTRATO', rejected: false, pendingSignature: !!contract };
    }
    return { stage: 'DOCUMENTACAO', rejected: false };
  }

  if (status === 'READY_FOR_NEXT_STAGE') {
    if (docRequirements.length === 0) {
      return { stage: 'DOCUMENTACAO', rejected: false };
    }

    const allApproved = docRequirements.every((r) => r.status === 'APPROVED');
    const hasSubmitted = docRequirements.some((r) => r.status === 'SUBMITTED');

    if (!allApproved && hasSubmitted) {
      return { stage: 'VALIDACAO', rejected: false };
    }
    if (!allApproved) {
      return { stage: 'DOCUMENTACAO', rejected: false };
    }

    if (!hasPrimeiraDataMeeting(meetings)) {
      return { stage: 'FERRAMENTAS', rejected: false };
    }
    if (reports.length === 0) {
      return { stage: 'RELATORIO', rejected: false };
    }

    return { stage: 'APROVACAO_FINAL', rejected: false };
  }

  return { stage: 'CADASTRO', rejected: false };
}

/** Human-readable label per pipeline stage, used in badges and tooltips. */
export const STAGE_LABELS: Record<ProcessStage | 'CONCLUIDO', string> = {
  CADASTRO: 'Cadastro',
  REUNIAO: 'Reunião',
  PROPOSTA: 'Proposta',
  CONTRATO: 'Contrato',
  DOCUMENTACAO: 'Documentação',
  VALIDACAO: 'Validação',
  FERRAMENTAS: 'Primeira Data',
  RELATORIO: 'Relatório',
  APROVACAO_FINAL: 'Aprovação Final',
  CONCLUIDO: 'Concluído',
};
