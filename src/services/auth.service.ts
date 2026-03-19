import { api } from '@/services/api';
import type { LoginRequest, LoginResponse, RegisterRequest } from '@/features/auth/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', credentials);
    return res.data;
  },
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/register', data);
    return res.data;
  },
};
