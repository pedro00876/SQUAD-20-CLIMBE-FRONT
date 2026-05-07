import { api } from '@/services/api';

export const notificationService = {
  testEmail: async (paraEmail: string): Promise<void> => {
    await api.get('/api/notifications/test-email', {
      params: { paraEmail },
    });
  },
};
