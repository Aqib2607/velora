import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthUser } from '@/store/useAuthStore';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface LoginPayload   { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string; password_confirmation: string }

interface AuthResponse {
    user : AuthUser;
    token: string;
}

// ──────────────────────────────────────────────────────────
// Hooks
// ──────────────────────────────────────────────────────────

/** Login with email + password → stores token in Zustand. */
export function useLogin() {
    const { setAuth } = useAuthStore();
    const navigate    = useNavigate();
    const qc          = useQueryClient();

    return useMutation({
        mutationFn: (payload: LoginPayload) =>
            apiFetch<AuthResponse>('POST', '/v1/auth/login', payload),

        onSuccess: ({ user, token }) => {
            setAuth(user, token);
            qc.invalidateQueries({ queryKey: ['me'] });
            toast.success(`Welcome back, ${user.name}!`);
            // Redirect to appropriate dashboard based on role
            if (user.role === 'admin')  { navigate('/admin/dashboard');  return; }
            if (user.role === 'seller') { navigate('/seller/dashboard'); return; }
            navigate('/');
        },

        onError: (error: { response?: { data?: { message?: string } } }) => {
            const msg = error?.response?.data?.message ?? 'Login failed. Check your credentials.';
            toast.error(msg);
        },
    });
}

/** Register a new buyer account. */
export function useRegister() {
    const { setAuth } = useAuthStore();
    const navigate    = useNavigate();
    const qc          = useQueryClient();

    return useMutation({
        mutationFn: (payload: RegisterPayload) =>
            apiFetch<AuthResponse>('POST', '/v1/auth/register', payload),

        onSuccess: ({ user, token }) => {
            setAuth(user, token);
            qc.invalidateQueries({ queryKey: ['me'] });
            toast.success('Account created! Welcome to Velora.');
            navigate('/');
        },

        onError: (error: { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
            const data   = error?.response?.data;
            const errors = data?.errors;
            if (errors) {
                // Show first validation error
                const first = Object.values(errors)[0]?.[0];
                if (first) { toast.error(first); return; }
            }
            toast.error(data?.message ?? 'Registration failed. Please try again.');
        },
    });
}

/** Logout — revokes token on server, clears local state. */
export function useLogout() {
    const { clearAuth } = useAuthStore();
    const navigate      = useNavigate();
    const qc            = useQueryClient();

    return useMutation({
        mutationFn: () => apiFetch<void>('POST', '/v1/auth/logout'),

        onSettled: () => {
            clearAuth();
            qc.clear();
            navigate('/login');
        },
    });
}

/** Fetch authenticated user profile (refetched if token changes). */
export function useCurrentUser() {
    const { isAuthenticated } = useAuthStore();

    return useQuery({
        queryKey: ['me'],
        queryFn : () => apiFetch<AuthUser>('GET', '/v1/auth/me'),
        enabled : isAuthenticated,
        staleTime: 1000 * 60 * 5, // 5 min — user data rarely changes mid-session
    });
}
