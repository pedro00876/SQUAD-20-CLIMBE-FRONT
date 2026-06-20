import { api } from '@/services/api';
import type { Service, CreateServiceRequest, UpdateServiceRequest } from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const productServiceClient = {
  listServices: async (page = 0, size = 10): Promise<PaginatedResponse<Service>> => {
    const res = await api.get<PaginatedResponse<Service>>('/api/services', {
      params: { page, size },
    });
    return res.data;
  },

  getService: async (id: number): Promise<Service> => {
    const res = await api.get<Service>(`/api/services/${id}`);
    return res.data;
  },

  createService: async (data: CreateServiceRequest): Promise<Service> => {
    const res = await api.post<Service>('/api/services', data);
    return res.data;
  },

  updateService: async (id: number, data: UpdateServiceRequest): Promise<Service> => {
    const res = await api.patch<Service>(`/api/services/${id}`, data);
    return res.data;
  },

  deleteService: async (id: number): Promise<void> => {
    await api.delete(`/api/services/${id}`);
  },
};
