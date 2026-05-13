import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    tenant_id: number;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    setAuth: (user: AuthUser, token: string) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
    hasRole: (role: UserRole) => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true,

            setAuth: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                }),

            clearAuth: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                }),

            setLoading: (loading) => set({ isLoading: loading }),

            hasRole: (role) => {
                const { user } = get();
                if (!user) return false;
                // Admin has access to all roles
                if (user.role === 'admin') return true;
                // Seller has access to seller and buyer routes
                if (user.role === 'seller' && (role === 'seller' || role === 'buyer')) return true;
                return user.role === role;
            },
        }),
        {
            name: 'velora-auth-storage',
            // On rehydration, mark loading as finished
            onRehydrateStorage: () => (state) => {
                if (state) {
                    state.isLoading = false;
                }
            },
        }
    )
);
