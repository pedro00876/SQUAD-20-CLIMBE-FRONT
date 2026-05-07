import { api } from '@/services/api';
import type { DocumentMetadata, DocumentUploadResponse, DocumentViewResponse } from '../types';

export const documentService = {
  uploadDocument: async (file: File, ownerId: string): Promise<DocumentUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('data', JSON.stringify({ ownerId }));

    const res = await api.post<DocumentUploadResponse>('/api/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  viewDocument: async (id: string): Promise<string> => {
    const res = await api.get<DocumentViewResponse>(`/api/documents/${id}/view`);
    return res.data.url;
  },
  listOwnerDocuments: async (ownerId: string): Promise<DocumentMetadata[]> => {
    const res = await api.get<DocumentMetadata[]>(`/api/documents/owner/${ownerId}`);
    return res.data;
  },
};
