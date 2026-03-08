import axios from 'axios';
import { env } from '@/config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@App:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Disparar evento de logout ou redirecionar
      localStorage.removeItem('@App:token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
