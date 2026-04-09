import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { propostasService, type PropostaListParams } from '@/features/propostas/services';
import type { Proposta } from '@/types/proposta.types';

const propostasKeys = {
  all: ['propostas'] as const,
  list: (params: PropostaListParams) => [...propostasKeys.all, 'list', params] as const,
};

export function usePropostas(params: PropostaListParams) {
  return useQuery({
    queryKey: propostasKeys.list(params),
    queryFn: () => propostasService.list(params),
  });
}

export function useCreateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Proposta) => propostasService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: propostasKeys.all }),
  });
}

export function useUpdateProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Proposta> }) => propostasService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: propostasKeys.all }),
  });
}

export function useDeleteProposta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => propostasService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: propostasKeys.all }),
  });
}
