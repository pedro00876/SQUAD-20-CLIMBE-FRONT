import type { ProcessStage } from '@/components/ui/ProcessStepper';

export interface DeriveStageResult {
  stage: ProcessStage;
  rejected: boolean;
}

/**
 * Derives the current pipeline stage from proposal + contract + doc state.
 * Extracted from empresa-detalhe so it can be reused on the empresas list,
 * dashboard funnel, and any other place that needs to know where an empresa is.
 */
export function deriveStage(
  proposal: { status?: string } | null,
  contract: unknown,
  docRequirements: { status?: string }[],
  reports: unknown[],
  spreadsheets: unknown[],
): DeriveStageResult {
  if (!proposal) return { stage: 'CADASTRO', rejected: false };

  const status = (proposal.status ?? '').toUpperCase();

  if (['RECEIVED', 'IN_TRIAGE', 'PENDING_ADJUSTMENTS'].includes(status)) {
    return { stage: 'REUNIAO', rejected: false };
  }

  if (status === 'ELIGIBLE' || status === 'COMMERCIAL_PROPOSAL') {
    return { stage: 'PROPOSTA', rejected: false };
  }

  if (status === 'COMMERCIAL_PROPOSAL_REJECTED') {
    return { stage: 'PROPOSTA', rejected: true };
  }

  if (status === 'COMMERCIAL_PROPOSAL_APPROVED' || status === 'READY_FOR_NEXT_STAGE') {
    if (!contract) return { stage: 'CONTRATO', rejected: false };
    if (docRequirements.length === 0) return { stage: 'DOCUMENTACAO', rejected: false };

    const allApproved = docRequirements.every(r => r.status === 'APPROVED');
    const hasSubmitted = docRequirements.some(r => r.status === 'SUBMITTED');

    if (!allApproved && hasSubmitted) return { stage: 'VALIDACAO', rejected: false };
    if (!allApproved) return { stage: 'DOCUMENTACAO', rejected: false };

    if (spreadsheets.length === 0) return { stage: 'FERRAMENTAS', rejected: false };
    if (reports.length === 0) return { stage: 'RELATORIO', rejected: false };

    return { stage: 'APROVACAO_FINAL', rejected: false };
  }

  return { stage: 'CADASTRO', rejected: false };
}

/** Human-readable label per pipeline stage, used in badges and tooltips. */
export const STAGE_LABELS: Record<ProcessStage | 'CONCLUIDO', string> = {
  CADASTRO:        'Cadastro',
  REUNIAO:         'Reunião',
  PROPOSTA:        'Proposta',
  CONTRATO:        'Contrato',
  DOCUMENTACAO:    'Documentação',
  VALIDACAO:       'Validação',
  FERRAMENTAS:     'Análise',
  RELATORIO:       'Relatório',
  APROVACAO_FINAL: 'Aprovação Final',
  CONCLUIDO:       'Concluído',
};
