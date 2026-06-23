import { api } from './api';
import type { PaginatedResponse } from '@/types/pagination';

export interface Report {
  id: number;
  contractId: number;
  pdfUrl?: string;
  sentAt?: string;
}

export interface CreateReportRequest {
  contractId: number;
}

export interface UpdateReportRequest {
  contractId?: number;
  pdfUrl?: string;
  sentAt?: string;
}

export const reportService = {
  list: async (page = 0, size = 10): Promise<PaginatedResponse<Report>> => {
    const response = await api.get<PaginatedResponse<Report>>('/api/reports', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Report> => {
    const response = await api.get<Report>(`/api/reports/${id}`);
    return response.data;
  },

  getByContract: async (contractId: number): Promise<Report[]> => {
    const response = await api.get<Report[]>(`/api/reports/contract/${contractId}`);
    return response.data;
  },

  create: async (data: CreateReportRequest & { pdfUrl?: string; sentAt?: string }): Promise<Report> => {
    const response = await api.post<Report>('/api/reports', data);
    return response.data;
  },

  // TODO(back): endpoint POST /api/reports/upload (multipart) pendente de implementação
  upload: async (data: CreateReportRequest, file: File): Promise<Report> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);
    const response = await api.post<Report>('/api/reports/upload', formData);
    return response.data;
  },

  update: async (id: number, data: UpdateReportRequest): Promise<Report> => {
    const response = await api.patch<Report>(`/api/reports/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/reports/${id}`);
  },

  getViewUrl: async (id: number): Promise<string> => {
    const response = await api.get<string>(`/api/reports/${id}/view`);
    return response.data;
  },
};
