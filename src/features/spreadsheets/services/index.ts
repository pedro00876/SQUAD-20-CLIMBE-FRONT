import { api } from '@/services/api';
import type { PaginatedResponse } from '@/types/pagination';

export interface Spreadsheet {
  id: number;
  contractId: number;
  googleSheetsUrl: string;
  locked: boolean;
  viewPermission: string;
}

export interface CreateSpreadsheetRequest {
  contractId: number;
  googleSheetsUrl?: string;
  locked?: boolean;
  viewPermission?: string;
}

export interface UpdateSpreadsheetRequest {
  contractId?: number;
  googleSheetsUrl?: string;
  locked?: boolean;
  viewPermission?: string;
}

export const spreadsheetService = {
  listSpreadsheets: async (page = 0, size = 20): Promise<PaginatedResponse<Spreadsheet>> => {
    const res = await api.get<PaginatedResponse<Spreadsheet>>('/api/spreadsheets', {
      params: { page, size },
    });
    return res.data;
  },

  getByContract: async (contractId: number): Promise<Spreadsheet[]> => {
    const res = await api.get<Spreadsheet[]>(`/api/spreadsheets/contract/${contractId}`);
    return res.data;
  },

  getSpreadsheet: async (id: number): Promise<Spreadsheet> => {
    const res = await api.get<Spreadsheet>(`/api/spreadsheets/${id}`);
    return res.data;
  },

  createSpreadsheet: async (data: CreateSpreadsheetRequest): Promise<Spreadsheet> => {
    const res = await api.post<Spreadsheet>('/api/spreadsheets', data);
    return res.data;
  },

  updateSpreadsheet: async (id: number, data: UpdateSpreadsheetRequest): Promise<Spreadsheet> => {
    const res = await api.patch<Spreadsheet>(`/api/spreadsheets/${id}`, data);
    return res.data;
  },

  deleteSpreadsheet: async (id: number): Promise<void> => {
    await api.delete(`/api/spreadsheets/${id}`);
  },
};
