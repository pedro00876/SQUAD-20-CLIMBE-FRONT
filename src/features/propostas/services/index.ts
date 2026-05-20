import { api } from '@/services/api';
import type { Proposal, ProposalRequest } from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const proposalService = {
  listProposals: async (page = 0, size = 10): Promise<PaginatedResponse<Proposal>> => {
    const res = await api.get<PaginatedResponse<Proposal>>('/api/proposals', {
      params: { page, size },
    });
    return res.data;
  },
  createProposal: async (data: ProposalRequest): Promise<Proposal> => {
    const res = await api.post<Proposal>('/api/proposals', data);
    return res.data;
  },
};
