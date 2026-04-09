import { api } from '@/services/api';
import type { PageResponse, QueryPaginationParams } from '@/types/api.types';
import type { Reuniao } from '@/types/reuniao.types';

export interface ReuniaoListParams extends QueryPaginationParams {
  search?: string;
}

export const reunioesService = {
  async list(params: ReuniaoListParams = {}) {
    const { data } = await api.get<PageResponse<Reuniao>>('/meetings', {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? 'date,desc',
      },
    });

    if (!params.search) return data;

    const search = params.search.toLowerCase();
    return {
      ...data,
      content: data.content.filter(
        (reuniao) =>
          (reuniao.enterpriseName ?? '').toLowerCase().includes(search) ||
          (reuniao.title ?? '').toLowerCase().includes(search) ||
          (reuniao.status ?? '').toLowerCase().includes(search),
      ),
    };
  },

  async create(payload: Reuniao) {
    const { data } = await api.post<Reuniao>('/meetings', payload);
    return data;
  },

  async update(id: number, payload: Partial<Reuniao>) {
    const { data } = await api.patch<Reuniao>(`/meetings/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/meetings/${id}`);
  },
};
