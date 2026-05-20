import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/features/auth/services';
import type { LoginRequest, RegisterRequest } from '@/features/auth/types';

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

export function useRegister() {
  const mutation = useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload),
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
