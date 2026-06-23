// ─── Tipos alinhados ao contrato do backend (ContractDTO) ────────────────────

// DIGITALLY_SIGNED avança automaticamente a proposta para READY_FOR_NEXT_STAGE
export type ContractStatus =
  | 'ATIVO'
  | 'ENCERRADO'
  | 'DIGITALLY_SIGNED'
  | (string & {});  // permite status livres enquanto o back não fixar o enum

export interface Contract {
  id: number;
  proposalId: number;
  startDate: string | null;
  endDate: string | null;
  status: ContractStatus | null;
}

export interface CreateContractRequest {
  proposalId: number;  // proposta deve estar em COMMERCIAL_PROPOSAL_APPROVED
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  status?: ContractStatus;
}

export interface UpdateContractRequest {
  proposalId?: number;
  startDate?: string;  // YYYY-MM-DD
  endDate?: string;    // YYYY-MM-DD
  status?: ContractStatus;
}

export interface EnrichedContract extends Contract {
  enterpriseId: number;
  enterpriseName: string;
}

export interface ContractCompanyGroup {
  enterpriseId: number;
  enterpriseName: string;
  contracts: EnrichedContract[];
}
