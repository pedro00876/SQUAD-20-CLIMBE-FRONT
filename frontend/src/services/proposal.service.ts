import { api } from './api';

export interface Proposal {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
  userId: number;
  userName: string;
  responsibleAnalystId?: number;
  responsibleAnalystName?: string;
  status: string;
  createdAt: string;
}

export interface CreateProposalRequest {
  enterpriseId: number;
  userId: number;
}

export const proposalService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/proposals?page=${page}&size=${size}`);
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await api.get(`/api/proposals/${id}`);
    return response.data;
  },
  
  create: async (data: CreateProposalRequest) => {
    const response = await api.post('/api/proposals', data);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string) => {
    const response = await api.patch(`/api/proposals/${id}`, { status });
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.patch(`/api/proposals/${id}`, data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/api/proposals/${id}`);
  }
};
