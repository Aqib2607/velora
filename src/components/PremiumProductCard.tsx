import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import { Product } from "@/types/domain";
import { Heart } from "lucide-react";
import { useWishlistQuery, useToggleWishlist } from "@/hooks/useWishlistQuery";

interface PremiumProductCardProps {
  product: Product;
  index?: number;
}

const PremiumProductCard = ({ product, index = 0 }: PremiumProductCardProps) => {
  const { data: wishlist = [] } = useWishlistQuery();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const isFav = wishlist.some(item => item.product_id === product.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col"
    >
      <Link to={`/product/${product.id}`} className="block h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-900 mb-6">
          <motion.img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist({ productId: product.id, isWishlisted: isFav });
            }}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-background transition-colors z-10"
          >
            <Heart className={`h-4 w-4 transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 px-1">
          <div className="flex items-center justify-between gap-4 mb-2">
            {product.seller && (
              <span className="text-[12px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                {typeof product.seller === 'object' ? product.seller?.company_name : product.seller}
              </span>
            )}
            {product.rating && (
              <div className="flex items-center gap-1 text-[12px] font-medium text-neutral-500">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {product.rating.toFixed(1)}
              </div>
            )}
          </div>
          
          <h3 className="font-display text-lg font-semibold text-foreground leading-tight tracking-tight mb-3 line-clamp-2">
            {product.name}
          </h3>

          <div className="mt-auto flex items-end gap-3">
            <span className="text-lg font-semibold tracking-tight text-foreground">
              ${(product.price || 0).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm font-medium tracking-tight text-neutral-400 line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PremiumProductCard;
