import { useQuery } from '@tanstack/react-query';
import { useDealsFilterStore } from '@/store/useDealsFilterStore';
import { apiFetch } from '@/lib/api';

export interface DealItem {
    id: string;
    title: string;
    brand: string;
    category: string;
    originalPrice: number;
    discountPrice: number;
    discountPercentage: number;
    rating: number;
    reviewCount: number;
    imageUrl: string;
    isPrimeExclusive: boolean;
    stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
    endsAtISO?: string;
    claimedPercentage?: number; // Flash deals
}

export interface DealsResponse {
    data: DealItem[];
    total: number;
}

type FilterParams = {
    category: string;
    minPrice: number | null;
    maxPrice: number | null;
    minDiscount: number | null;
    brands: string[];
    primeOnly: boolean;
};

const fetchDeals = async (filters: FilterParams, page: number = 1, limit: number = 20): Promise<DealsResponse> => {
    // For now, proxy to standard catalog products, as deals endpoint is a subset
    const params: Record<string, any> = { page, limit };
    if (filters.category !== 'All') params.category = filters.category;
    if (filters.minPrice !== null) params.min_price = filters.minPrice;
    if (filters.maxPrice !== null) params.max_price = filters.maxPrice;

    const res = await apiFetch<any[]>('GET', '/v1/catalog/products', undefined, params);
    
    // Map backend Products to Frontend DealItems to prevent breaking DealCard
    const mapped: DealItem[] = (res || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || p.name || 'Unknown',
        brand: 'Velora',
        category: p.category || 'General',
        originalPrice: (p.price || 100) * 1.2,
        discountPrice: p.price || 80,
        discountPercentage: 20,
        rating: p.rating || 4.5,
        reviewCount: p.reviewsCount || 100,
        imageUrl: p.thumbnail || p.image || '',
        isPrimeExclusive: false,
        stockStatus: p.stock > 0 ? 'In Stock' : 'Out of Stock'
    }));

    return {
        data: mapped,
        total: mapped.length,
    };
};

export const useDealsQuery = (page: number = 1, limit: number = 20) => {
    const { category, minPrice, maxPrice, minDiscount, brands, primeOnly } = useDealsFilterStore();
    const filters = { category, minPrice, maxPrice, minDiscount, brands, primeOnly };

    return useQuery({
        queryKey: ['deals', filters, page, limit],
        queryFn: () => fetchDeals(filters, page, limit),
        staleTime: 1000 * 60 * 5,
    });
};
