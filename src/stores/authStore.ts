import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
    isAuthenticated: boolean;
    user: {
        id: string;
        email: string;
        nombre?: string;
        rol?: string;
    } | null;
    login: (user: AuthState['user']) => void;
    logout: () => void;
    updateUser: (user: Partial<AuthState['user']>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            isAuthenticated: false,
            user: null,
            login: (user) => set({ isAuthenticated: true, user }),
            logout: () => set({ isAuthenticated: false, user: null }),
            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),
        }),
        {
            name: 'fitgym-auth',
        }
    )
);
