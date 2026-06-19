import { api } from '@/services/api';
import type {
  Contract,
  CreateContractRequest,
  UpdateContractRequest,
} from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const contractService = {
  listContracts: async (page = 0, size = 10): Promise<PaginatedResponse<Contract>> => {
    const res = await api.get<PaginatedResponse<Contract>>('/api/contracts', {
      params: { page, size },
    });
    return res.data;
  },

  getContract: async (id: number): Promise<Contract> => {
    const res = await api.get<Contract>(`/api/contracts/${id}`);
    return res.data;
  },

  getContractsByProposal: async (proposalId: number): Promise<Contract[]> => {
    const res = await api.get<Contract[]>(`/api/contracts/proposal/${proposalId}`);
    return res.data;
  },

  createContract: async (data: CreateContractRequest): Promise<Contract> => {
    const res = await api.post<Contract>('/api/contracts', data);
    return res.data;
  },

  updateContract: async (id: number, data: UpdateContractRequest): Promise<Contract> => {
    const res = await api.patch<Contract>(`/api/contracts/${id}`, data);
    return res.data;
  },

  deleteContract: async (id: number): Promise<void> => {
    await api.delete(`/api/contracts/${id}`);
  },

  allocateTeam: async (
    contractId: number,
    userIds: number[],
    roleInTeam: string,
  ): Promise<void> => {
    await api.post(`/api/contracts/${contractId}/team`, null, {
      params: { userIds, roleInTeam },
    });
  },
};
