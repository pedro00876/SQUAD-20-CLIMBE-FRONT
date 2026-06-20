import { api } from '@/services/api';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../types';
import type { PaginatedResponse } from '@/types/pagination';

export const permissionService = {
  listPermissions: async (page = 0, size = 10): Promise<PaginatedResponse<Permission>> => {
    const res = await api.get<PaginatedResponse<Permission>>('/api/permissions', {
      params: { page, size },
    });
    return res.data;
  },

  getPermission: async (id: number): Promise<Permission> => {
    const res = await api.get<Permission>(`/api/permissions/${id}`);
    return res.data;
  },

  createPermission: async (data: CreatePermissionRequest): Promise<Permission> => {
    const res = await api.post<Permission>('/api/permissions', data);
    return res.data;
  },

  updatePermission: async (id: number, data: UpdatePermissionRequest): Promise<Permission> => {
    const res = await api.patch<Permission>(`/api/permissions/${id}`, data);
    return res.data;
  },

  deletePermission: async (id: number): Promise<void> => {
    await api.delete(`/api/permissions/${id}`);
  },
};
