import { api } from '@/services/api';
import type { PageResponse, QueryPaginationParams } from '@/types/api.types';
import type { Proposta } from '@/types/proposta.types';

export interface PropostaListParams extends QueryPaginationParams {
  search?: string;
}

export const propostasService = {
  async list(params: PropostaListParams = {}) {
    const { data } = await api.get<PageResponse<Proposta>>('/proposals', {
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
        (proposta) =>
          (proposta.enterpriseName ?? '').toLowerCase().includes(search) ||
          (proposta.userName ?? '').toLowerCase().includes(search) ||
          (proposta.status ?? '').toLowerCase().includes(search),
      ),
    };
  },

  async create(payload: Proposta) {
    const { data } = await api.post<Proposta>('/proposals', payload);
    return data;
  },

  async update(id: number, payload: Partial<Proposta>) {
    const { data } = await api.patch<Proposta>(`/proposals/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/proposals/${id}`);
  },
};
