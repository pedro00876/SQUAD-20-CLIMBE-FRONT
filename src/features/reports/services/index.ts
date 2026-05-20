import { api } from '@/services/api';

export const reportService = {
  generatePDFReport: async (): Promise<Blob> => {
    const res = await api.get('/api/reports', {
      responseType: 'blob',
    });
    return res.data;
  },
};
