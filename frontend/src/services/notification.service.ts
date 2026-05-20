import { api } from './api';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  read: boolean;
  type: string;
  createdAt: string;
}

export const notificationService = {
  listByUser: async (userId: number) => {
    const response = await api.get(`/api/notifications/user/${userId}`);
    return response.data;
  },
  
  markAsRead: async (id: number) => {
    const response = await api.patch(`/api/notifications/${id}`, { read: true });
    return response.data;
  },
  
  delete: async (id: number) => {
    await api.delete(`/api/notifications/${id}`);
  },

  sendEmail: async (para: string, assunto: string, corpo: string) => {
    const response = await api.post('/api/notifications/send-email', { para, assunto, corpo });
    return response.data;
  },

  notifyCompliance: async (dados: any) => {
    const response = await api.post('/api/notifications/compliance', dados);
    return response.data;
  }
};
