import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export interface Category {
    id: number;
    name: string;
    slug: string;
    icon?: string;
    image?: string;
    description?: string;
}

export function useCategoriesQuery() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: () => apiFetch<Category[]>('GET', '/v1/categories'),
    });
}
