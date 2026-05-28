import { api } from './api';

export interface Contract {
  id: number;
  proposalId: number;
  proposalEnterpriseName: string;
  enterpriseId: number;
  enterpriseName: string;
  startDate: string;
  endDate?: string;
  totalValue: number;
  status: string;
}

export interface CreateContractRequest {
  proposalId: number;
  startDate: string;
  endDate?: string;
}

export const contractService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/contracts?page=${page}&size=${size}`);
    return response.data;
  },
  
  create: async (data: CreateContractRequest) => {
    const response = await api.post('/api/contracts', data);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/api/contracts/${id}`);
  }
};
