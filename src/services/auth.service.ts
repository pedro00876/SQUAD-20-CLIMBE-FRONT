import { api } from '@/services/api';
import type { LoginRequest, LoginResponse } from '@/features/auth/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/api/auth/login', credentials);
    return res.data;
  },
};
