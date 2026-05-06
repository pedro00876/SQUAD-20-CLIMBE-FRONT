export interface Proposal {
  id: number;
  enterpriseId: string;
  serviceId: number;
  valor: number;
  status: string;
  dataCriacao: string;
}

export interface ProposalRequest {
  enterpriseId: string;
  serviceId: number;
  analistaId: string;
  valor: number;
  descricao?: string;
}
