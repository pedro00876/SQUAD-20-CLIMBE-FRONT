import { api } from '@/services/api';
import type { Contract } from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const contractService = {
  listContracts: async (page = 0, size = 10): Promise<PaginatedResponse<Contract>> => {
    const res = await api.get<PaginatedResponse<Contract>>('/api/contracts', {
      params: { page, size },
    });
    return res.data;
  },
  generateContract: async (proposalId: number): Promise<Contract> => {
    const res = await api.post<Contract>('/api/contracts', { proposalId });
    return res.data;
  },
  getContractByProposal: async (proposalId: number): Promise<Contract> => {
    const res = await api.get<Contract>(`/api/contracts/proposal/${proposalId}`);
    return res.data;
  },
};
