import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosService, type UserListParams } from '@/features/usuarios/services';
import type { User } from '@/types/user.types';

const usuariosKeys = {
  all: ['usuarios'] as const,
  list: (params: UserListParams) => [...usuariosKeys.all, 'list', params] as const,
};

export function useUsuarios(params: UserListParams) {
  return useQuery({
    queryKey: usuariosKeys.list(params),
    queryFn: () => usuariosService.list(params),
  });
}

export function useCreateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: User) => usuariosService.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.all }),
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<User> }) => usuariosService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.all }),
  });
}

export function useDeleteUsuario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => usuariosService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.all }),
  });
}
