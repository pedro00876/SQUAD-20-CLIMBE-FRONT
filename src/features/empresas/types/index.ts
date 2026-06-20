// ─── Tipos alinhados ao contrato do backend (EnterpriseDTO) ───────────────────

export interface Address {
  street: string | null;
  number: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
}

export interface Enterprise {
  id: number;
  legalName: string;
  tradeName: string | null;
  cnpj: string;
  address: Address | null;
  phone: string | null;
  email: string;
  representativeName: string | null;
  representativeCpf: string | null;
  representativePhone: string | null;
}

export interface CreateEnterpriseRequest {
  legalName: string;
  tradeName?: string;
  cnpj: string;
  address?: Address;
  phone?: string;
  email: string;
  representativeName?: string;
  representativeCpf?: string;
  representativePhone?: string;
}

export type UpdateEnterpriseRequest = Partial<CreateEnterpriseRequest>;

// ─── API externa: BrasilAPI ───────────────────────────────────────────────────
// Mantida para uso pontual de consulta externa. NÃO é o retorno do backend.
export interface BrasilAPI_CNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  // ... other fields if needed
}
