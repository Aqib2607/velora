import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface HomepageMetrics {
  total_products: number;
  active_sellers: number;
  countries_served: number;
  total_orders: number;
}

export interface HomepageCategory {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface HomepageSeller {
  name: string;
  count: number;
  rating: string | number;
}

export interface HomepageProduct {
  id: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  rating: number;
  seller: {
    company_name: string;
  };
}

export interface HomepageData {
  metrics: HomepageMetrics;
  categories: HomepageCategory[];
  recent_products: HomepageProduct[];
  trending_products: HomepageProduct[];
  featured_sellers: HomepageSeller[];
}

export function useHomepageQuery() {
  return useQuery({
    queryKey: ['homepage'],
    queryFn: async () => {
      const res = await apiFetch<HomepageData | { data: HomepageData }>('GET', '/v1/homepage');
      if (res && 'data' in res && res.data && !('metrics' in res)) {
          return res.data as HomepageData;
      }
      return res as HomepageData;
    },
    staleTime: 60000,
  });
}
