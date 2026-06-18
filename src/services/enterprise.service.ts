import { api } from './api';

export interface Address {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface Enterprise {
  id: number;
  legalName: string;
  tradeName?: string;
  cnpj: string;
  email: string;
  phone?: string;
  representativeName?: string;
  representativeCpf?: string;
  representativePhone?: string;
  address?: Address;
}

export interface CreateEnterpriseRequest {
  legalName: string;
  tradeName?: string;
  cnpj: string;
  email: string;
  phone?: string;
  representativeName?: string;
  representativeCpf?: string;
  representativePhone?: string;
  address?: Address;
}

export type UpdateEnterpriseRequest = Partial<CreateEnterpriseRequest>;

export const enterpriseService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/enterprises?page=${page}&size=${size}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/enterprises/${id}`);
    return response.data;
  },
  
  create: async (data: CreateEnterpriseRequest) => {
    const response = await api.post('/api/enterprises', data);
    return response.data;
  },

  update: async (id: number, data: UpdateEnterpriseRequest): Promise<Enterprise> => {
    const response = await api.patch<Enterprise>(`/api/enterprises/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/api/enterprises/${id}`);
  }
};
