import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { empresasService, type EmpresaListParams } from '@/features/empresas/services';
import type { Empresa } from '@/types/empresa.types';

const empresasKeys = {
  all: ['empresas'] as const,
  list: (params: EmpresaListParams) => [...empresasKeys.all, 'list', params] as const,
};

export function useEmpresas(params: EmpresaListParams) {
  return useQuery({
    queryKey: empresasKeys.list(params),
    queryFn: () => empresasService.list(params),
  });
}

export function useCreateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Empresa) => empresasService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: empresasKeys.all }),
  });
}

export function useUpdateEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Empresa> }) => empresasService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: empresasKeys.all }),
  });
}

export function useDeleteEmpresa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => empresasService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: empresasKeys.all }),
  });
}
