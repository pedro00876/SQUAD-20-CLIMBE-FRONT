import type { ProposalStatus } from './types';

/** Transições PATCH manuais permitidas pelo backend */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  ProposalStatus,
  ProposalStatus[]
> = {
  RECEIVED: ['IN_TRIAGE'],
  IN_TRIAGE: ['ELIGIBLE', 'PENDING_ADJUSTMENTS'],
  PENDING_ADJUSTMENTS: ['IN_TRIAGE'],
  ELIGIBLE: [],
  COMMERCIAL_PROPOSAL: ['COMMERCIAL_PROPOSAL_APPROVED', 'COMMERCIAL_PROPOSAL_REJECTED'],
  COMMERCIAL_PROPOSAL_APPROVED: [],
  COMMERCIAL_PROPOSAL_REJECTED: [],
  READY_FOR_NEXT_STAGE: [],
};

export function canPatchStatus(
  from: ProposalStatus | string | undefined,
  to: ProposalStatus | string,
): boolean {
  if (!from) return false;
  const current = from.toUpperCase() as ProposalStatus;
  const next = to.toUpperCase() as ProposalStatus;
  return ALLOWED_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

/** Status avançados automaticamente pelo backend — não usar PATCH */
export const AUTO_ADVANCED_STATUSES = new Set<ProposalStatus>([
  'COMMERCIAL_PROPOSAL',
  'READY_FOR_NEXT_STAGE',
]);
