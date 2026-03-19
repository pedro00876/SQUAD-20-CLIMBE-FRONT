import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '@/contexts/AuthContext';
import { authService } from '@/services/auth.service';
import type { LoginRequest } from '@/features/auth/types';

export function useLogin() {
  const { login } = useAuthContext();

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: async (data) => {
      await login(data);
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
