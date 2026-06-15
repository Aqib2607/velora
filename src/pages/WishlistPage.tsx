import { Link } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useWishlistQuery, useToggleWishlist } from "@/hooks/useWishlistQuery";
import { useAddToCart } from "@/hooks/useCartQuery";
import { convertAndFormat } from "@/utils/currency";
import { useRegionStore } from "@/store/useRegionStore";

const WishlistPage = () => {
  const { data: wishlistItems, isLoading } = useWishlistQuery();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart } = useAddToCart();
  const { currency, locale } = useRegionStore();

  if (isLoading) {
    return <div className="container-premium py-12 text-center">Loading wishlist...</div>;
  }

  return (
    <div className="container-premium py-8 lg:py-12">
      <h1 className="font-display text-3xl font-bold mb-8">My Wishlist</h1>
      
      {!wishlistItems || wishlistItems.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-border bg-card">
          <div className="text-4xl mb-4">❤️</div>
          <h2 className="font-display text-xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">Save items you love to review them later.</p>
          <Link to="/" className="px-6 py-3 rounded-xl bg-foreground text-background font-semibold hover:-translate-y-0.5 transition-all">Start Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card overflow-hidden group flex flex-col">
              <Link to={`/product/${item.product.id}`} className="aspect-square bg-muted overflow-hidden relative block">
                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-lg line-clamp-2 mb-2">{item.product.name}</h3>
                <p className="font-bold text-foreground mb-4 mt-auto">
                  {convertAndFormat(item.product.price, currency, locale)}
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => addToCart({ sku_id: item.product.id, quantity: 1 })}
                    className="flex-1 px-4 py-2 bg-foreground text-background font-semibold rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add
                  </button>
                  <button 
                    onClick={() => toggleWishlist({ productId: item.product.id, isWishlisted: true })}
                    className="p-2 border border-border rounded-xl text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
