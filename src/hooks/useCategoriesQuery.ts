import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
    description?: string;
    productCount?: number;
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const res = await apiFetch<Category[] | { data: Category[] }>('GET', '/v1/catalog/categories');
            if (res && Array.isArray(res)) return res;
            if (res && 'data' in res && Array.isArray(res.data)) return res.data;
            return [];
        },
    });
}
