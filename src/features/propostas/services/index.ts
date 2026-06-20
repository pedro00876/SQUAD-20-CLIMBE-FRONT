import { api } from '@/services/api';
import type {
  Proposal,
  CreateProposalRequest,
  UpdateProposalRequest,
} from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const proposalService = {
  listProposals: async (page = 0, size = 10): Promise<PaginatedResponse<Proposal>> => {
    const res = await api.get<PaginatedResponse<Proposal>>('/api/proposals', {
      params: { page, size },
    });
    return res.data;
  },

  getProposal: async (id: number): Promise<Proposal> => {
    const res = await api.get<Proposal>(`/api/proposals/${id}`);
    return res.data;
  },

  getProposalsByEnterprise: async (enterpriseId: number): Promise<Proposal[]> => {
    const res = await api.get<Proposal[]>(`/api/proposals/enterprise/${enterpriseId}`);
    return res.data;
  },

  getProposalsByUser: async (userId: number): Promise<Proposal[]> => {
    const res = await api.get<Proposal[]>(`/api/proposals/user/${userId}`);
    return res.data;
  },

  createProposal: async (data: CreateProposalRequest): Promise<Proposal> => {
    const res = await api.post<Proposal>('/api/proposals', data);
    return res.data;
  },

  updateProposal: async (id: number, data: UpdateProposalRequest): Promise<Proposal> => {
    const res = await api.patch<Proposal>(`/api/proposals/${id}`, data);
    return res.data;
  },

  deleteProposal: async (id: number): Promise<void> => {
    await api.delete(`/api/proposals/${id}`);
  },
};
