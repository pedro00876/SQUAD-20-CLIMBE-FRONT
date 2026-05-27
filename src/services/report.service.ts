import { api } from './api';

export interface Report {
  id: number;
  contractId: number;
  pdfUrl?: string;
  sentAt?: string;
  createdAt?: string;
  status?: string;
}

export interface CreateReportRequest {
  contractId: number;
}

interface PaginatedReports {
  content: Report[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export const reportService = {
  list: async (page = 0, size = 10): Promise<PaginatedReports> => {
    const response = await api.get<PaginatedReports>(`/api/reports?page=${page}&size=${size}`);
    return response.data;
  },
  
  getByContract: async (contractId: number): Promise<Report[]> => {
    const response = await api.get<Report[]>(`/api/reports/contract/${contractId}`);
    return response.data;
  },

  upload: async (data: CreateReportRequest, file: File): Promise<Report> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    formData.append('file', file);

    const response = await api.post<Report>('/api/reports/upload', formData);
    return response.data;
  },

  getViewUrl: async (id: number): Promise<string> => {
    const response = await api.get<string>(`/api/reports/${id}/view`);
    return response.data;
  },
};
