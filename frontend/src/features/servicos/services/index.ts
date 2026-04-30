import { api } from '@/services/api';
import type { Service, ServiceRequest } from '../types';
import { PaginatedResponse } from '@/types/pagination';

export const productServiceClient = {
  listServices: async (page = 0, size = 10): Promise<PaginatedResponse<Service>> => {
    const res = await api.get<PaginatedResponse<Service>>('/api/services', {
      params: { page, size },
    });
    return res.data;
  },
  createService: async (data: ServiceRequest): Promise<Service> => {
    const res = await api.post<Service>('/api/services', data);
    return res.data;
  },
};
