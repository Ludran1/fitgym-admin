import { create } from 'zustand';

interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    loading: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setTheme: (theme: UIState['theme']) => void;
    setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
    sidebarOpen: true,
    theme: 'system',
    loading: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    setTheme: (theme) => set({ theme }),
    setLoading: (loading) => set({ loading }),
}));
