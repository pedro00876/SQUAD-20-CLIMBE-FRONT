import { api } from './api';
import type { Contract, CreateContractRequest, UpdateContractRequest } from '@/features/contracts/types';
import type { PaginatedResponse } from '@/types/pagination';

export type { Contract, CreateContractRequest, UpdateContractRequest };

export const contractService = {
  list: async (page = 0, size = 10): Promise<PaginatedResponse<Contract>> => {
    const res = await api.get<PaginatedResponse<Contract>>('/api/contracts', {
      params: { page, size },
    });
    return res.data;
  },

  listByProposal: async (proposalId: number): Promise<Contract[]> => {
    const res = await api.get<Contract[]>(`/api/contracts/proposal/${proposalId}`);
    return res.data;
  },

  getById: async (id: number): Promise<Contract> => {
    const res = await api.get<Contract>(`/api/contracts/${id}`);
    return res.data;
  },

  create: async (data: CreateContractRequest): Promise<Contract> => {
    const res = await api.post<Contract>('/api/contracts', data);
    return res.data;
  },

  update: async (id: number, data: UpdateContractRequest): Promise<Contract> => {
    const res = await api.patch<Contract>(`/api/contracts/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/contracts/${id}`);
  },

  getViewUrl: async (id: number): Promise<string> => {
    const res = await api.get<string>(`/api/contracts/${id}/view`);
    return res.data;
  },

  /** Aloca equipe e dispara criação do ambiente no Google Drive/Sheets */
  allocateTeam: async (id: number, userIds: number[], roleInTeam: string): Promise<void> => {
    await api.post(
      `/api/contracts/${id}/team`,
      null,
      { params: { userIds: userIds.join(','), roleInTeam } },
    );
  },
};
