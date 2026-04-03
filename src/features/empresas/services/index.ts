import { api } from '@/services/api';
import type { PageResponse, QueryPaginationParams } from '@/types/api.types';
import type { Empresa } from '@/types/empresa.types';

export interface EmpresaListParams extends QueryPaginationParams {
  search?: string;
}

export const empresasService = {
  async list(params: EmpresaListParams = {}) {
    const { data } = await api.get<PageResponse<Empresa>>('/enterprises', {
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
        (empresa) =>
          empresa.legalName.toLowerCase().includes(search) ||
          (empresa.tradeName ?? '').toLowerCase().includes(search) ||
          empresa.email.toLowerCase().includes(search) ||
          empresa.cnpj.includes(params.search ?? ''),
      ),
    };
  },

  async create(payload: Empresa) {
    const { data } = await api.post<Empresa>('/enterprises', payload);
    return data;
  },

  async update(id: number, payload: Partial<Empresa>) {
    const { data } = await api.patch<Empresa>(`/enterprises/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/enterprises/${id}`);
  },
};
