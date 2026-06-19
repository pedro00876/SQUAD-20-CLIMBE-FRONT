// ─── Tipos alinhados ao contrato do backend (ProposalDTO) ────────────────────

export type ProposalStatus =
  | 'RECEIVED'
  | 'IN_TRIAGE'
  | 'ELIGIBLE'
  | 'PENDING_ADJUSTMENTS'
  | 'COMMERCIAL_PROPOSAL'
  | 'COMMERCIAL_PROPOSAL_APPROVED'
  | 'COMMERCIAL_PROPOSAL_REJECTED'
  | 'READY_FOR_NEXT_STAGE';

export interface Proposal {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
  userId: number;
  userName: string;
  responsibleAnalystId: number | null;
  responsibleAnalystName: string | null;
  status: ProposalStatus;
  createdAt: string;
}

export interface CreateProposalRequest {
  enterpriseId: number;
  userId: number;
  createdAt?: string; // ISO 8601
}

export interface UpdateProposalRequest {
  enterpriseId?: number;
  userId?: number;
  responsibleAnalystId?: number;
  status?: ProposalStatus;
}
