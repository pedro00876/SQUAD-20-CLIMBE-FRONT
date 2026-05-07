import { api } from '@/services/api';
import type { Enterprise, EnterpriseDTO, BrasilAPI_CNPJ } from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const enterpriseService = {
  listEnterprises: async (page = 0, size = 10): Promise<PaginatedResponse<Enterprise>> => {
    const res = await api.get<PaginatedResponse<Enterprise>>('/api/enterprises', {
      params: { page, size },
    });
    return res.data;
  },
  createEnterprise: async (data: EnterpriseDTO): Promise<Enterprise> => {
    const res = await api.post<Enterprise>('/api/enterprises', data);
    return res.data;
  },
  consultCNPJ: async (cnpj: string): Promise<BrasilAPI_CNPJ> => {
    const res = await api.get<BrasilAPI_CNPJ>(`/api/enterprises/cnpj/${cnpj}`);
    return res.data;
  },
};
