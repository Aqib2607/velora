import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/useAuthStore';
import { trackAPILatency, trackError } from './metrics';

// ──────────────────────────────────────────────────────────
// Velora API Client
// Attaches auth token + tenant ID to every request.
// Auto-clears auth on 401 responses.
// ──────────────────────────────────────────────────────────

const TENANT_ID = import.meta.env.VITE_TENANT_ID ?? '1';
const BASE_URL  = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export const api = axios.create({
    baseURL        : BASE_URL,
    headers        : { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    withCredentials: false,
});

// ── Request interceptor: attach token + tenant header ──────
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['X-Tenant-ID'] = TENANT_ID;

    // Store request start time for metrics
    (config as any).startTime = Date.now();

    return config;
});

// ── Response interceptor: handle 401 globally + track metrics ──────────────
api.interceptors.response.use(
    (res) => {
        // Track successful API latency
        const config = res.config as any;
        if (config.startTime) {
            const duration = Date.now() - config.startTime;
            trackAPILatency(
                res.config.url || '',
                res.config.method?.toUpperCase() || 'UNKNOWN',
                duration,
                res.status
            );
        }
        return res;
    },
    (error: AxiosError) => {
        // Track failed API latency
        const config = error.config as any;
        if (config?.startTime) {
            const duration = Date.now() - config.startTime;
            trackAPILatency(
                config.url || '',
                config.method?.toUpperCase() || 'UNKNOWN',
                duration,
                error.response?.status || 0
            );
        }

        // Track API errors
        if (error.response?.status === 401) {
            useAuthStore.getState().clearAuth();
            // Let the router's ProtectedRoute redirect to login
        } else if (error.message) {
            trackError(`API Error: ${error.message}`, undefined, {
                type: 'api_error',
                status: String(error.response?.status || 0),
                endpoint: error.config?.url || 'unknown',
            });
        }

        return Promise.reject(error);
    },
);

// ──────────────────────────────────────────────────────────
// Typed response helper — unwraps { status, data } envelope
// ──────────────────────────────────────────────────────────
export async function apiFetch<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: unknown,
    params?: Record<string, unknown>,
): Promise<T> {
    const res = await api.request<{ status: string; data: T }>({
        method,
        url,
        data,
        params,
    });
    return res.data.data;
}
