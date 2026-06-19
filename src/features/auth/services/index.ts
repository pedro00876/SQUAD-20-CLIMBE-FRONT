import { api } from '@/services/api';
import type { LoginRequest, LoginResponse, User } from '@/features/auth/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', credentials);
    return res.data;
  },
  // `register` removido — POST /api/auth/register não existe no backend.
  // Fluxo correto: solicitar acesso via requestAccess ou criar usuário via POST /api/users (somente CEO).
  requestAccess: async (email: string): Promise<void> => {
    await api.post('/api/auth/request-access', { email });
  },
  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },
  refresh: async (): Promise<void> => {
    await api.post('/api/auth/refresh');
  },
  // `getPermissions` e `createPermission` removidos — endpoint /api/permissions não existe no backend.
  getMe: async (): Promise<User> => {
    const res = await api.get<User>('/api/auth/me');
    return res.data;
  },
};
