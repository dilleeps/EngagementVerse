import { create } from 'zustand';
import type { AppUser } from '@engagement-verse/shared';
import { clearTokens } from '@/lib/auth';

interface AuthStoreState {
  user: AppUser | null;
  token: string | null;

  // Actions
  setUser: (user: AppUser) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStoreState>((set) => ({
  user: null,
  token: null,

  setUser: (user) => set({ user }),

  setToken: (token) => set({ token }),

  logout: () => {
    clearTokens();
    set({ user: null, token: null });
  },
}));
