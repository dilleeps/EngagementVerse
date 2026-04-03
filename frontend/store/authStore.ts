import { create } from 'zustand';
import type { AppUser } from '@/types';
import { clearTokens, isAuthenticated as checkAuth } from '@/lib/auth';

interface AuthStoreState {
  user: AppUser | null;
  token: string | null;
  isAuthenticated: boolean;

  setUser: (user: AppUser) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: checkAuth(),

  setUser: (user) => set({ user, isAuthenticated: true }),

  setToken: (token) => set({ token }),

  clearUser: () => set({ user: null, isAuthenticated: false }),

  logout: () => {
    clearTokens();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
