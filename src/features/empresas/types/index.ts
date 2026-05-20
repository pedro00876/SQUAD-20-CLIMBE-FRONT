export interface Enterprise {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface EnterpriseDTO {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface BrasilAPI_CNPJ {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  // ... other fields if needed
}
