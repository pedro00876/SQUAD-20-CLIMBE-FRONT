import { api } from './api';
import type { PaginatedResponse } from '@/types/pagination';
import type {
  Document,
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentRequirement,
  CreateDocumentRequirementRequest,
  UpdateDocumentRequirementRequest,
  DocumentType,
  DocumentRequirementStatus,
} from '@/features/documentos/types';

export type { Document, CreateDocumentRequest, UpdateDocumentRequest, DocumentRequirement, CreateDocumentRequirementRequest, UpdateDocumentRequirementRequest, DocumentType, DocumentRequirementStatus };

export const documentService = {
  list: async (page = 0, size = 10): Promise<PaginatedResponse<Document>> => {
    const response = await api.get<PaginatedResponse<Document>>(`/api/documents?page=${page}&size=${size}`);
    return response.data;
  },

  getByEnterprise: async (enterpriseId: number): Promise<Document[]> => {
    const response = await api.get<Document[]>(`/api/documents/enterprise/${enterpriseId}`);
    return response.data;
  },

  findByAnalyst: async (analystId: number): Promise<Document[]> => {
    const response = await api.get<Document[]>(`/api/documents/analyst/${analystId}`);
    return response.data;
  },

  getDocument: async (id: number): Promise<Document> => {
    const response = await api.get<Document>(`/api/documents/${id}`);
    return response.data;
  },

  upload: async (data: CreateDocumentRequest, file?: File): Promise<Document> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) {
      formData.append('file', file);
    }
    const response = await api.post<Document>('/api/documents', formData);
    return response.data;
  },

  getViewUrl: async (id: number): Promise<string> => {
    const response = await api.get<string>(`/api/documents/${id}/view`);
    return response.data;
  },

  updateDocument: async (id: number, data: UpdateDocumentRequest): Promise<Document> => {
    const response = await api.patch<Document>(`/api/documents/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/documents/${id}`);
  },
};

export const documentRequirementService = {
  listByProposal: async (proposalId: number): Promise<DocumentRequirement[]> => {
    const response = await api.get<DocumentRequirement[]>(`/api/proposals/${proposalId}/documents/requirements`);
    return response.data;
  },

  createForProposal: async (proposalId: number, data: CreateDocumentRequirementRequest): Promise<DocumentRequirement[]> => {
    const response = await api.post<DocumentRequirement[]>(
      `/api/proposals/${proposalId}/documents/requirements`,
      data,
    );
    return response.data;
  },

  update: async (id: number, data: UpdateDocumentRequirementRequest): Promise<DocumentRequirement> => {
    const response = await api.patch<DocumentRequirement>(`/api/documents/requirements/${id}`, data);
    return response.data;
  },
};
