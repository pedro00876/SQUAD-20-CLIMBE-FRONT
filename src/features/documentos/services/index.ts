import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
} from '../types';

export const documentService = {
  listDocuments: async (page = 0, size = 10): Promise<PaginatedResponse<Document>> => {
    const res = await api.get<PaginatedResponse<Document>>(`/api/documents?page=${page}&size=${size}`);
    return res.data;
  },

  listByEnterprise: async (enterpriseId: number): Promise<Document[]> => {
    const res = await api.get<Document[]>(`/api/documents/enterprise/${enterpriseId}`);
    return res.data;
  },

  listByAnalyst: async (analystId: number): Promise<Document[]> => {
    const res = await api.get<Document[]>(`/api/documents/analyst/${analystId}`);
    return res.data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const res = await api.get<Document>(`/api/documents/${id}`);
    return res.data;
  },

  uploadDocument: async (data: CreateDocumentRequest, file?: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    const res = await api.post<Document>('/api/documents', formData);
    return res.data;
  },

  viewDocument: async (id: number): Promise<string> => {
    const res = await api.get<string>(`/api/documents/${id}/view`);
    return res.data;
  },

  updateDocument: async (id: number, data: UpdateDocumentRequest): Promise<Document> => {
    const res = await api.patch<Document>(`/api/documents/${id}`, data);
    return res.data;
  },

  deleteDocument: async (id: number): Promise<void> => {
    await api.delete(`/api/documents/${id}`);
  },
};
