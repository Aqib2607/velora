import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    thumbnail: string;
    images?: string[];
    categoryId: number;
    sellerId: number;
    status: string;
    stock: number;
    rating?: number;
    reviewsCount?: number;
}

export function useProductsQuery(filters?: Record<string, unknown>) {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: () => apiFetch<Product[]>('GET', '/v1/catalog/products', undefined, filters),
    });
}
