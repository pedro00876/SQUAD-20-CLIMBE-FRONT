import { api } from './api';

export interface Report {
  id: number;
  contractId: number;
  pdfUrl: string;
  sentAt: string;
}

export const reportService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/reports?page=${page}&size=${size}`);
    return response.data;
  },
  
  getByContract: async (contractId: number) => {
    const response = await api.get(`/api/reports/contract/${contractId}`);
    return response.data;
  }
};
