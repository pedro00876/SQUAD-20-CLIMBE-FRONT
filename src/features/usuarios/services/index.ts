import { api } from '@/services/api';
import type { User, UserPatchRequest, Cargo, CargoRequest, PaginatedResponse } from '../types';

export const userService = {
  listUsers: async (page = 0, size = 10): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>('/api/users', {
      params: { page, size },
    });
    return res.data;
  },
  getUserDetails: async (id: string): Promise<User> => {
    const res = await api.get<User>(`/api/users/${id}`);
    return res.data;
  },
  updateUser: async (id: string, data: UserPatchRequest): Promise<User> => {
    const res = await api.patch<User>(`/api/users/${id}`, data);
    return res.data;
  },
  approveUser: async (id: string): Promise<void> => {
    await api.patch(`/api/users/${id}/approve`);
  },
};

export const cargoService = {
  listCargos: async (): Promise<Cargo[]> => {
    const res = await api.get<Cargo[]>('/api/cargos');
    return res.data;
  },
  createCargo: async (data: CargoRequest): Promise<Cargo> => {
    const res = await api.post<Cargo>('/api/cargos', data);
    return res.data;
  },
  getCargoById: async (id: number): Promise<Cargo> => {
    const res = await api.get<Cargo>(`/api/cargos/${id}`);
    return res.data;
  },
};
