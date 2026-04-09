export interface Proposta {
  id?: number;
  enterpriseId: number;
  enterpriseName?: string;
  userId: number;
  userName?: string;
  status?: string;
  createdAt?: string;
}

export interface PropostaFormValues {
  enterpriseId: string;
  userId: string;
  status: string;
}
