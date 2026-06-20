import { api } from '@/services/api';
import { PaginatedResponse } from '@/types/pagination';
import { Notification, CreateNotificationRequest, UpdateNotificationRequest } from '../types';

export const notificationService = {
  listNotifications: async (page = 0, size = 20): Promise<PaginatedResponse<Notification>> => {
    const res = await api.get<PaginatedResponse<Notification>>('/api/notifications', {
      params: { page, size },
    });
    return res.data;
  },

  listByUser: async (userId: number): Promise<Notification[]> => {
    const res = await api.get<Notification[]>(`/api/notifications/user/${userId}`);
    return res.data;
  },

  getNotification: async (id: number): Promise<Notification> => {
    const res = await api.get<Notification>(`/api/notifications/${id}`);
    return res.data;
  },

  createNotification: async (data: CreateNotificationRequest): Promise<Notification> => {
    const res = await api.post<Notification>('/api/notifications', data);
    return res.data;
  },

  updateNotification: async (id: number, data: UpdateNotificationRequest): Promise<Notification> => {
    const res = await api.patch<Notification>(`/api/notifications/${id}`, data);
    return res.data;
  },

  deleteNotification: async (id: number): Promise<void> => {
    await api.delete(`/api/notifications/${id}`);
  },

  testEmail: async (paraEmail: string, assunto?: string): Promise<void> => {
    await api.get('/api/notifications/test-email', {
      params: { paraEmail, assunto },
    });
  },
};
