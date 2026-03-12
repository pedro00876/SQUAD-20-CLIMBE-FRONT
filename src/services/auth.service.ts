import { api } from './api';

export const authService = {
  login: async (credentials: unknown) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
};
