import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Product } from "@/types/domain";

export interface WishlistItem {
  id: number;
  user_id: number;
  product_id: number;
  product: Product;
}

export function useWishlistQuery() {
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await apiFetch<{ data: WishlistItem[] }>('GET', '/v1/wishlist');
      return res.data;
    },
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, isWishlisted }: { productId: number, isWishlisted: boolean }) => {
      if (isWishlisted) {
        return apiFetch('DELETE', `/v1/wishlist/${productId}`);
      } else {
        return apiFetch('POST', '/v1/wishlist', { product_id: productId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
