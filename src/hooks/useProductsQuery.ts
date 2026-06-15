import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

import { Product as DomainProduct, Category, SellerProfile, Sku } from '@/types/domain';

export interface Product extends DomainProduct {
    reviewCount: number;
    stock: number;
}

export function useProductsQuery(filters?: Record<string, string | number | boolean>) {
    return useQuery({
        queryKey: ['products', filters],
        queryFn: async () => {
            const res = await apiFetch<DomainProduct[] | { data: DomainProduct[] }>('GET', '/v1/catalog/products', undefined, filters);
            let rawData: DomainProduct[] = [];
            if (res && Array.isArray(res)) rawData = res;
            else if (res && 'data' in res && Array.isArray(res.data)) rawData = res.data;
            
            return rawData.map((p) => {
                const defaultSku = p.skus?.[0] || ({} as Sku);
                const cat = (typeof p.category === 'object' ? p.category?.name : p.category) || 'Uncategorized';
                const sell = typeof p.seller === 'object' ? (p.seller as SellerProfile)?.company_name : p.seller;
                
                return {
                    id: p.id,
                    name: p.name || 'Unknown Product',
                    description: p.description || '',
                    price: Number(defaultSku.price || 0),
                    originalPrice: defaultSku.compare_price ? Number(defaultSku.compare_price) : undefined,
                    image: p.thumbnail || p.images?.[0] || 'https://via.placeholder.com/400',
                    images: p.images || [],
                    category: cat,
                    seller: sell || 'Velora Partner',
                    status: p.status || 'active',
                    stock: defaultSku.inventory?.quantity || 100,
                    rating: Number(p.attributes?.rating) || 5.0,
                    reviewCount: Number(p.attributes?.reviewCount) || 0,
                    skus: p.skus,
                    options: p.options || [],
                    variants: p.variants || [],
                } as Product;
            });
        },
    });
}
