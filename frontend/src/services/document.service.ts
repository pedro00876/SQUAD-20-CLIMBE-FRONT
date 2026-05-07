import { api } from './api';

export interface Document {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
  name: string;
  type: string;
  url: string;
  status: string;
  analystId?: number;
  createdAt: string;
}

export const documentService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/documents?page=${page}&size=${size}`);
    return response.data;
  },
  
  getByEnterprise: async (enterpriseId: number) => {
    const response = await api.get(`/api/documents/enterprise/${enterpriseId}`);
    return response.data;
  },
  
  getViewUrl: async (id: number) => {
    const response = await api.get(`/api/documents/${id}/view`);
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/api/documents/${id}`);
  }
};
