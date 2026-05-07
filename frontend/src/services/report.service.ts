import { api } from './api';

export interface Report {
  id: number;
  proposalId: number;
  name: string;
  type: string;
  content: string;
  createdAt: string;
}

export const reportService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/reports?page=${page}&size=${size}`);
    return response.data;
  },
  
  getByProposal: async (proposalId: number) => {
    const response = await api.get(`/api/reports/proposal/${proposalId}`);
    return response.data;
  }
};
