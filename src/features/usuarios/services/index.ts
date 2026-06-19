import { api } from '@/services/api';
import type { User, UserPatchRequest, Cargo, CargoRequest, PaginatedResponse, CreateUserRequest } from '../types';

export const userService = {
  listUsers: async (page = 0, size = 10): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>('/api/users', {
      params: { page, size },
    });
    return res.data;
  },
  getUserDetails: async (id: number): Promise<User> => {
    const res = await api.get<User>(`/api/users/${id}`);
    return res.data;
  },
  getUserByEmail: async (email: string): Promise<User> => {
    const res = await api.get<User>(`/api/users/email/${email}`);
    return res.data;
  },
  getUserByCpf: async (cpf: string): Promise<User> => {
    const res = await api.get<User>(`/api/users/cpf/${cpf}`);
    return res.data;
  },
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const res = await api.post<User>('/api/users', data);
    return res.data;
  },
  updateUser: async (id: number, data: UserPatchRequest): Promise<User> => {
    const res = await api.patch<User>(`/api/users/${id}`, data);
    return res.data;
  },
  approveUser: async (id: number, role: string): Promise<void> => {
    await api.patch(`/api/users/${id}/approve`, { role });
  },
  listPending: async (page = 0, size = 20): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>('/api/users/pending', { params: { page, size } });
    return res.data;
  },
  getDeletedUsers: async (page = 0, size = 20): Promise<PaginatedResponse<User>> => {
    const res = await api.get<PaginatedResponse<User>>('/api/users/deleted', { params: { page, size } });
    return res.data;
  },
  deleteUser: async (id: number): Promise<void> => {
    await api.delete(`/api/users/${id}`);
  },
};

export const cargoService = {
  listCargos: async (page = 0, size = 20): Promise<PaginatedResponse<Cargo>> => {
    const res = await api.get<PaginatedResponse<Cargo>>('/api/roles', { params: { page, size } });
    return res.data;
  },
  getCargoById: async (id: number): Promise<Cargo> => {
    const res = await api.get<Cargo>(`/api/roles/${id}`);
    return res.data;
  },
  createCargo: async (data: CargoRequest): Promise<Cargo> => {
    const res = await api.post<Cargo>('/api/roles', data);
    return res.data;
  },
  updateCargo: async (id: number, data: { name?: string }): Promise<Cargo> => {
    const res = await api.patch<Cargo>(`/api/roles/${id}`, data);
    return res.data;
  },
  deleteCargo: async (id: number): Promise<void> => {
    await api.delete(`/api/roles/${id}`);
  },
};
