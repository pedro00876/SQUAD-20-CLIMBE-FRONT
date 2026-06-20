import { api } from '@/services/api';
import type {
  Enterprise,
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
} from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const enterpriseService = {
  listEnterprises: async (page = 0, size = 10): Promise<PaginatedResponse<Enterprise>> => {
    const res = await api.get<PaginatedResponse<Enterprise>>('/api/enterprises', {
      params: { page, size },
    });
    return res.data;
  },

  getEnterprise: async (id: number): Promise<Enterprise> => {
    const res = await api.get<Enterprise>(`/api/enterprises/${id}`);
    return res.data;
  },

  getEnterpriseByEmail: async (email: string): Promise<Enterprise> => {
    const res = await api.get<Enterprise>(`/api/enterprises/email/${email}`);
    return res.data;
  },

  getEnterpriseByCnpj: async (cnpj: string): Promise<Enterprise> => {
    const res = await api.get<Enterprise>(`/api/enterprises/cnpj/${cnpj}`);
    return res.data;
  },

  createEnterprise: async (data: CreateEnterpriseRequest): Promise<Enterprise> => {
    const res = await api.post<Enterprise>('/api/enterprises', data);
    return res.data;
  },

  updateEnterprise: async (id: number, data: UpdateEnterpriseRequest): Promise<Enterprise> => {
    const res = await api.patch<Enterprise>(`/api/enterprises/${id}`, data);
    return res.data;
  },

  deleteEnterprise: async (id: number): Promise<void> => {
    await api.delete(`/api/enterprises/${id}`);
  },
};
