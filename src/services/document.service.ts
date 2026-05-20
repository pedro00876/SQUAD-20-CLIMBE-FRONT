import { api } from './api';

export interface Document {
  id: number;
  enterpriseId: number;
  enterpriseName: string;
  proposalId?: number;
  name?: string;
  type?: string;
  documentType?: string;
  url: string;
  status?: string;
  validated?: boolean;
  analystId?: number;
  analystName?: string;
  createdAt?: string;
}

export interface CreateDocumentRequest {
  enterpriseId: number;
  proposalId?: number;
  documentType?: string;
  validated?: boolean;
  analystId?: number;
}

export const documentService = {
  list: async (page = 0, size = 10) => {
    const response = await api.get(`/api/documents?page=${page}&size=${size}`);
    return response.data;
  },

  upload: async (data: CreateDocumentRequest, file: File) => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await api.post('/api/documents', formData);
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
