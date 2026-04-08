import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reunioesService, type ReuniaoListParams } from '@/features/reunioes/services';
import type { Reuniao } from '@/types/reuniao.types';

const reunioesKeys = {
  all: ['reunioes'] as const,
  list: (params: ReuniaoListParams) => [...reunioesKeys.all, 'list', params] as const,
};

export function useReunioes(params: ReuniaoListParams) {
  return useQuery({
    queryKey: reunioesKeys.list(params),
    queryFn: () => reunioesService.list(params),
  });
}

export function useCreateReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Reuniao) => reunioesService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reunioesKeys.all }),
  });
}

export function useUpdateReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Reuniao> }) => reunioesService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reunioesKeys.all }),
  });
}

export function useDeleteReuniao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => reunioesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reunioesKeys.all }),
  });
}
