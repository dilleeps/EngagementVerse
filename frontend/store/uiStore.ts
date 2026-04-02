import { create } from 'zustand';

interface UIStoreState {
  sidebarOpen: boolean;
  activeScreen: string;

  // Actions
  toggleSidebar: () => void;
  setActiveScreen: (screen: string) => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  sidebarOpen: true,
  activeScreen: 'dashboard',

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setActiveScreen: (screen) =>
    set({ activeScreen: screen }),
}));
