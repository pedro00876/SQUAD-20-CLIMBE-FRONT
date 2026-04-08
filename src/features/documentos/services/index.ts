import { api } from '@/services/api';
import type { PageResponse, QueryPaginationParams } from '@/types/api.types';
import type { Documento } from '@/types/documento.types';

export interface DocumentoListParams extends QueryPaginationParams {
  search?: string;
}

export const documentosService = {
  async list(params: DocumentoListParams = {}) {
    const { data } = await api.get<PageResponse<Documento>>('/documents', {
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
        (documento) =>
          (documento.enterpriseName ?? '').toLowerCase().includes(search) ||
          (documento.documentType ?? '').toLowerCase().includes(search) ||
          (documento.analystName ?? '').toLowerCase().includes(search),
      ),
    };
  },

  async create(payload: Documento) {
    const { data } = await api.post<Documento>('/documents', payload);
    return data;
  },

  async update(id: number, payload: Partial<Documento>) {
    const { data } = await api.patch<Documento>(`/documents/${id}`, payload);
    return data;
  },

  async remove(id: number) {
    await api.delete(`/documents/${id}`);
  },
};
