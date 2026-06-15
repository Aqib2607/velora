import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

export interface SellerStats {
    revenue        : number;
    orders         : number;
    active_products: number;
    refund_rate    : number;
    pending_payouts: number;
}

export interface SellerProduct {
    id         : number;
    name       : string;
    price      : number;
    status     : 'draft' | 'published' | 'archived';
    category_id: number;
    created_at : string;
}

export interface SellerOrder {
    id           : number;
    order_number : string;
    status       : string;
    total        : number;
    created_at   : string;
    user         : { id: number; name: string; email: string };
    items        : SellerOrderItem[];
}

export interface SellerOrderItem {
    id         : number;
    product_id : number;
    quantity   : number;
    subtotal   : number;
}

export interface SellerPayout {
    id         : number;
    amount     : number;
    status     : 'pending' | 'paid' | 'failed';
    created_at : string;
}

export interface SellerPayoutResponse {
    payouts: { data: SellerPayout[] };
    summary: { total_paid: number; total_pending: number };
    stripe_account_id: string | null;
}

export interface SellerAnalytics {
    period        : string;
    from          : string;
    summary       : { total_revenue: number; total_orders: number; avg_order_value: number };
    daily_revenue  : { date: string; revenue: number; orders: number }[];
    top_products  : { product_id: number; revenue: number; units_sold: number; product: { name: string } }[];
}

export interface SellerRefund {
    id: number;
    order_id: number;
    amount: number;
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    created_at: string;
}

// ──────────────────────────────────────────────────────────
// Query Hooks
// ──────────────────────────────────────────────────────────

/** Dashboard KPI stats */
export function useSellerStats() {
    return useQuery<SellerStats>({
        queryKey: ['seller', 'stats'],
        queryFn : () => apiFetch('GET', '/v1/seller-dashboard/stats'),
    });
}

/** Paginated product list with optional filters */
export function useSellerProducts(filters?: { status?: string; search?: string; page?: number }) {
    return useQuery({
        queryKey: ['seller', 'products', filters],
        queryFn : () => apiFetch('GET', '/v1/seller-dashboard/products', undefined, filters as Record<string, string | number | boolean | undefined>),
    });
}

/** Paginated seller orders */
export function useSellerOrders(filters?: { status?: string; page?: number }) {
    return useQuery({
        queryKey: ['seller', 'orders', filters],
        queryFn : () => apiFetch('GET', '/v1/seller-dashboard/orders', undefined, filters as Record<string, string | number | boolean | undefined>),
    });
}

/** Payouts with summary */
export function useSellerPayouts() {
    return useQuery<SellerPayoutResponse>({
        queryKey: ['seller', 'payouts'],
        queryFn : () => apiFetch('GET', '/v1/seller-dashboard/payouts'),
    });
}

/** Revenue analytics with period selection */
export function useSellerAnalytics(period: '7d' | '30d' | '90d' | '12m' = '30d') {
    return useQuery<SellerAnalytics>({
        queryKey: ['seller', 'analytics', period],
        queryFn : () => apiFetch('GET', '/v1/seller-dashboard/analytics', undefined, { period }),
    });
}

/** Paginated refund/RMA requests */
export function useSellerRefunds(filters?: { status?: string; page?: number }) {
    return useQuery({
        queryKey: ['seller', 'refunds', filters],
        queryFn : () => apiFetch('GET', '/v1/refunds', undefined, filters as Record<string, string | number | boolean | undefined>),
    });
}

// ──────────────────────────────────────────────────────────
// Mutation Hooks
// ──────────────────────────────────────────────────────────

interface ProductPayload {
    name: string; description: string; price: number;
    category_id: number; status?: 'draft' | 'published'; stock?: number;
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: ProductPayload) => apiFetch('POST', '/v1/seller-products', data),
        onSuccess : () => { qc.invalidateQueries({ queryKey: ['seller', 'products'] }); toast.success('Product created!'); },
        onError   : () => toast.error('Failed to create product.'),
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<ProductPayload> & { id: number }) =>
            apiFetch('PATCH', `/v1/seller-products/${id}`, data),
        onSuccess : () => { qc.invalidateQueries({ queryKey: ['seller', 'products'] }); toast.success('Product updated!'); },
        onError   : () => toast.error('Failed to update product.'),
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiFetch('DELETE', `/v1/seller-products/${id}`),
        onSuccess : () => { qc.invalidateQueries({ queryKey: ['seller', 'products'] }); toast.success('Product archived.'); },
        onError   : () => toast.error('Failed to archive product.'),
    });
}

export function useApproveRefund() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiFetch('POST', `/v1/refunds/${id}/approve`),
        onSuccess : () => { qc.invalidateQueries({ queryKey: ['seller', 'refunds'] }); toast.success('Refund approved.'); },
        onError   : () => toast.error('Failed to approve refund.'),
    });
}

export function useRejectRefund() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => apiFetch('POST', `/v1/refunds/${id}/reject`),
        onSuccess : () => { qc.invalidateQueries({ queryKey: ['seller', 'refunds'] }); toast.success('Refund rejected.'); },
        onError   : () => toast.error('Failed to reject refund.'),
    });
}

export function useOnboardStripe() {
    return useMutation({
        mutationFn: () => apiFetch<{ url: string }>('POST', '/v1/seller-dashboard/stripe/onboard'),
        onSuccess : (data) => {
            if (data?.url) {
                window.location.href = data.url;
            }
        },
        onError   : () => toast.error('Failed to generate Stripe onboarding link.'),
    });
}
