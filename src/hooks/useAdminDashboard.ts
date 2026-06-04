import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface AdminStats {
    total_orders    : number;
    paid_orders     : number;
    total_revenue   : number;
    orders_today    : number;
    active_sellers  : number;
    pending_sellers : number;
    refund_rate     : number;
}

export interface AdminOrder {
    id          : number;
    order_number: string;
    status      : string;
    total       : number;
    created_at  : string;
    user        : { id: number; name: string; email: string };
}

export interface AdminUser {
    id        : number;
    name      : string;
    email     : string;
    status    : string;
    created_at: string;
    roles     : { id: number; name: string }[];
}

export interface AuditLog {
    id        : number;
    user_id   : number;
    action    : string;
    payload   : Record<string, unknown>;
    created_at: string;
    user      : { id: number; name: string; email: string } | null;
}

export interface Tenant {
    id        : number;
    name      : string;
    slug      : string;
    domain    : string | null;
    status    : string;
    plan      : string;
    settings  : Record<string, unknown> | null;
    created_at: string;
}

export interface CommissionRule {
    id          : number;
    name        : string;
    type        : string;
    rate        : number;
    category_id : number | null;
    is_default  : boolean;
    is_active   : boolean;
    created_at  : string;
    category    : { id: number; name: string } | null;
}

// ──────────────────────────────────────────────────────────
// Query Hooks
// ──────────────────────────────────────────────────────────

/** Platform-wide KPI report */
export function useAdminStats() {
    return useQuery<AdminStats>({
        queryKey: ['admin', 'stats'],
        queryFn : () => apiFetch('GET', '/v1/admin/reports'),
        staleTime: 1000 * 60, // 1 minute
    });
}

/** Paginated order list with filters */
export function useAdminOrders(filters?: { status?: string; search?: string; page?: number }) {
    return useQuery({
        queryKey: ['admin', 'orders', filters],
        queryFn : () => apiFetch('GET', '/v1/admin/orders', undefined, filters as Record<string, unknown>),
    });
}

/** Paginated user list */
export function useAdminUsers(filters?: { search?: string; status?: string; page?: number }) {
    return useQuery({
        queryKey: ['admin', 'users', filters],
        queryFn : () => apiFetch('GET', '/v1/admin/users', undefined, filters as Record<string, unknown>),
    });
}

/** Audit log feed */
export function useAuditLogs(filters?: { action?: string; page?: number }) {
    return useQuery({
        queryKey: ['admin', 'audit-logs', filters],
        queryFn : () => apiFetch('GET', '/v1/admin/audit-logs', undefined, filters as Record<string, unknown>),
        refetchInterval: 30_000, // Poll every 30s for live audit feed
    });
}

/** Tenants list */
export function useAdminTenants(filters?: { search?: string; status?: string; page?: number }) {
    return useQuery({
        queryKey: ['admin', 'tenants', filters],
        queryFn : () => apiFetch('GET', '/v1/admin/tenants', undefined, filters as Record<string, unknown>),
    });
}

/** Commissions list */
export function useAdminCommissions(filters?: { type?: string; page?: number }) {
    return useQuery({
        queryKey: ['admin', 'commissions', filters],
        queryFn : () => apiFetch('GET', '/v1/admin/commissions', undefined, filters as Record<string, unknown>),
    });
}

// ──────────────────────────────────────────────────────────
// Mutation Hooks
// ──────────────────────────────────────────────────────────

export function useApproveSeller() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (applicationId: number) =>
            apiFetch('POST', `/v1/admin/sellers/${applicationId}/approve`),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
            toast.success('Seller approved and activated.');
        },
        onError: () => toast.error('Failed to approve seller.'),
    });
}

export function useRejectSeller() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            apiFetch('POST', `/v1/admin/sellers/${id}/reject`, { reason }),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
            toast.success('Seller rejected.');
        },
        onError: () => toast.error('Failed to reject seller.'),
    });
}

export function useCreateTenant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Tenant>) => apiFetch('POST', '/v1/admin/tenants', data),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
            toast.success('Tenant created successfully.');
        },
        onError: () => toast.error('Failed to create tenant.'),
    });
}

export function useUpdateTenant() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Tenant> & { id: number }) => apiFetch('PUT', `/v1/admin/tenants/${id}`, data),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'tenants'] });
            toast.success('Tenant updated successfully.');
        },
        onError: () => toast.error('Failed to update tenant.'),
    });
}

export function useCreateCommission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CommissionRule>) => apiFetch('POST', '/v1/admin/commissions', data),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'commissions'] });
            toast.success('Commission rule created successfully.');
        },
        onError: () => toast.error('Failed to create commission rule.'),
    });
}

export function useUpdateCommission() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<CommissionRule> & { id: number }) => apiFetch('PUT', `/v1/admin/commissions/${id}`, data),
        onSuccess : () => {
            qc.invalidateQueries({ queryKey: ['admin', 'commissions'] });
            toast.success('Commission rule updated successfully.');
        },
        onError: () => toast.error('Failed to update commission rule.'),
    });
}
