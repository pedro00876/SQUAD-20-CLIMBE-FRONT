import axios from 'axios';
import { env } from '@/config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  withCredentials: false,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Não redirecionar se a falha for em rotas de autenticação (evita loops no login)
      const isAuthRoute = error.config.url?.includes('/auth/');
      
      if (!isAuthRoute && window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('@App:user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
