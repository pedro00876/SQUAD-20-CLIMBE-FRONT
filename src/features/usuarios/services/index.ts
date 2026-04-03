import { api } from '@/services/api';
import type { PageResponse, QueryPaginationParams } from '@/types/api.types';
import type { User } from '@/types/user.types';

export interface UserListParams extends QueryPaginationParams {
  search?: string;
}

export const usuariosService = {
  async list(params: UserListParams = {}) {
    const { data } = await api.get<PageResponse<User>>('/users', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'id,desc',
      },
    });

    if (!params.search) return data;

    const search = params.search.toLowerCase();
    return {
      ...data,
      content: data.content.filter(
        (user) =>
          user.fullName.toLowerCase().includes(search) ||
          user.email.toLowerCase().includes(search) ||
          user.cpf.includes(params.search ?? ''),
      ),
    };
  },

  async create(payload: User) {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  async update(id: number, payload: Partial<User>) {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/users/${id}`);
  },
};
