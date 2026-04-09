import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentosService, type DocumentoListParams } from '@/features/documentos/services';
import type { Documento } from '@/types/documento.types';

const documentosKeys = {
  all: ['documentos'] as const,
  list: (params: DocumentoListParams) => [...documentosKeys.all, 'list', params] as const,
};

export function useDocumentos(params: DocumentoListParams) {
  return useQuery({
    queryKey: documentosKeys.list(params),
    queryFn: () => documentosService.list(params),
  });
}

export function useCreateDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Documento) => documentosService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentosKeys.all }),
  });
}

export function useUpdateDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Documento> }) => documentosService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentosKeys.all }),
  });
}

export function useDeleteDocumento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => documentosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: documentosKeys.all }),
  });
}
