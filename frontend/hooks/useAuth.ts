import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { post } from '@/lib/api';
import { setAccessToken, setRefreshToken, clearTokens } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import type { User, LoginPayload, AuthTokens } from '@/types';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export function useAuth() {
  const { user, isAuthenticated, setUser, clearUser } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (payload) =>
      post<LoginResponse>('/api/v1/auth/login', payload),
    onSuccess: (data) => {
      setAccessToken(data.tokens.access_token);
      setRefreshToken(data.tokens.refresh_token);
      setUser(data.user);
    },
  });

  const login = useCallback(
    (email: string, password: string) =>
      loginMutation.mutateAsync({ email, password }),
    [loginMutation],
  );

  const logout = useCallback(() => {
    clearTokens();
    clearUser();
    queryClient.clear();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }, [clearUser, queryClient]);

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}
