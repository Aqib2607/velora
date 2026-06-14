import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

export interface CartItem {
    id: number;
    sku_id: number;
    quantity: number;
    unit_price: number;
    sku: {
        id: number;
        price: number;
        product: {
            id: number;
            name: string;
            description: string;
            thumbnail?: string;
        }
    }
}

export interface Cart {
    id: number;
    user_id: number;
    status: string;
    items: CartItem[];
}

export function useCartQuery() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: async () => {
            try {
                const res = await apiFetch<Cart>('GET', '/v1/cart');
                return res;
            } catch (e) {
                return null;
            }
        },
    });
}

export function useAddToCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { sku_id: number; quantity: number }) => 
            apiFetch('POST', '/v1/cart/items', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Added to cart');
        },
        onError: () => {
            toast.error('Failed to add to cart. Please log in.');
        }
    });
}

export function useRemoveFromCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (itemId: number) => 
            apiFetch('DELETE', `/v1/cart/items/${itemId}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}

export function useUpdateCartQuantity() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: number, quantity: number }) => 
            apiFetch('PUT', `/v1/cart/items/${itemId}`, { quantity }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}

export function useClearCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => apiFetch('DELETE', '/v1/cart'),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['cart'] });
        }
    });
}
