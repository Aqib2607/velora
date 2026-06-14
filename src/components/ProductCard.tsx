import { Link } from "react-router-dom";
import { ShoppingCart, Star, Heart } from "lucide-react";
import { useAddToCart } from "@/hooks/useCartQuery";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import type { Product } from "@/hooks/useProductsQuery";

const ProductCard = ({ product }: { product: Product }) => {
  const { mutate: addToCart } = useAddToCart();
  const { currency, locale } = useRegionStore();

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden hover-lift shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mt-1">
          <Star className="h-3.5 w-3.5 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-lg font-bold">{convertAndFormat(product.price, currency, locale)}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {convertAndFormat(product.originalPrice, currency, locale)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">by {typeof product.seller === 'object' ? product.seller?.company_name : product.seller}</p>
        <button
          onClick={(e) => { e.preventDefault(); addToCart({ sku_id: product.skus?.[0]?.id || product.id, quantity: 1 }); }}
          className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
