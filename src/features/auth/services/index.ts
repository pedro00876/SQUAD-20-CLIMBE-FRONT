import { api } from '@/services/api';
import type { LoginRequest, LoginResponse, Permission, RegisterRequest, User } from '@/features/auth/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', credentials);
    return res.data;
  },
  register: async (payload: RegisterRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/register', payload);
    return res.data;
  },
  requestAccess: async (email: string): Promise<void> => {
    await api.post('/api/auth/request-access', { email });
  },
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
  refresh: async (): Promise<void> => {
    await api.post('/api/auth/refresh');
  },
  getPermissions: async (): Promise<Permission[]> => {
    const res = await api.get<Permission[]>('/api/permissions');
    return res.data;
  },
  createPermission: async (data: Partial<Permission>): Promise<Permission> => {
    const res = await api.post<Permission>('/api/permissions', data);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/api/auth/me');
    return res.data;
  },
};
