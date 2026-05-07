import { api } from '@/services/api';

export interface SpreadsheetSync {
  id: string;
  name: string;
  spreadsheetId: string;
}

export const spreadsheetService = {
  listSpreadsheets: async (): Promise<SpreadsheetSync[]> => {
    const res = await api.get<SpreadsheetSync[]>('/api/spreadsheets');
    return res.data;
  },
  createSpreadsheetSync: async (data: Partial<SpreadsheetSync>): Promise<SpreadsheetSync> => {
    const res = await api.post<SpreadsheetSync>('/api/spreadsheets', data);
    return res.data;
  },
};
