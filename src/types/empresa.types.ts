export interface EmpresaAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Empresa {
  id?: number;
  legalName: string;
  tradeName?: string;
  cnpj: string;
  address?: EmpresaAddress;
  phone?: string;
  email: string;
  representativeName?: string;
  representativeCpf?: string;
  representativePhone?: string;
}

export interface EmpresaFormValues {
  legalName: string;
  tradeName: string;
  cnpj: string;
  email: string;
  phone: string;
  representativeName: string;
  representativeCpf: string;
  representativePhone: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}
