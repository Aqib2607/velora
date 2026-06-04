import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Order {
    id: number;
    status: string;
    totalAmount: number;
    currencyCode: string;
    createdAt: string;
    items?: any[];
}

export function useOrdersQuery() {
    return useQuery({
        queryKey: ['orders'],
        queryFn: () => apiFetch<{ data: Order[] }>('GET', '/v1/orders').then(res => res.data),
    });
}
