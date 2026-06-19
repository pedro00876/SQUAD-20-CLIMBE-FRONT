import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services';
import type { LoginRequest } from '@/features/auth/types';

export function useLogin() {
  const { login } = useAuthContext();

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: async (data) => {
      await login(data as any);
    },
  });

  return {
    login: mutation.mutate,
    loginAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useRequestAccess() {
  const mutation = useMutation({
    mutationFn: (email: string) => authService.requestAccess(email),
  });

  return {
    requestAccess: mutation.mutate,
    requestAccessAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

// `useRegister` migrado para `requestAccess` — POST /api/auth/register não existe no backend.
// O fluxo de cadastro envia apenas o e-mail para POST /api/auth/request-access.
export function useRegister() {
  const mutation = useMutation({
    mutationFn: (payload: { email: string }) => authService.requestAccess(payload.email),
  });

  return {
    register: mutation.mutate,
    registerAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}
