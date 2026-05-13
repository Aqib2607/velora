import { motion } from "framer-motion";
import { Heart, ShoppingCart, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PremiumProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating?: number;
    reviews?: number;
    badge?: string;
    seller?: string;
  };
  index?: number;
}

const PremiumProductCard = ({ product, index = 0 }: PremiumProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <Link to={`/product/${product.id}`}>
        <div className={cn(
          "relative rounded-2xl overflow-hidden transition-all duration-300",
          "bg-card border border-border",
          "hover:shadow-premium hover:border-brand-500/50"
        )}>
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              animate={{
                scale: isHovered ? 1.1 : 1,
              }}
              transition={{ duration: 0.4 }}
            />

            {/* Overlay on Hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.badge && (
                <motion.span
                  className="px-3 py-1 rounded-full glass text-xs font-semibold text-white backdrop-blur-md"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {product.badge}
                </motion.span>
              )}
              {discount > 0 && (
                <motion.span
                  className="px-3 py-1 rounded-full bg-error text-white text-xs font-bold"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  -{discount}%
                </motion.span>
              )}
            </div>

            {/* Quick Actions */}
            <motion.div
              className="absolute top-3 right-3 flex flex-col gap-2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                className={cn(
                  "p-2 rounded-full backdrop-blur-md transition-colors",
                  isFavorite 
                    ? "bg-error text-white" 
                    : "bg-white/90 dark:bg-black/90 text-foreground hover:bg-error hover:text-white"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </motion.button>

              <motion.button
                className="p-2 rounded-full bg-gradient-brand text-white backdrop-blur-md"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.preventDefault();
                  // Add to cart logic
                }}
              >
                <ShoppingCart className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Quick View Button */}
            <motion.div
              className="absolute bottom-3 left-3 right-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <button className="w-full py-2 rounded-lg glass-strong text-sm font-semibold backdrop-blur-md hover:bg-white/90 dark:hover:bg-black/90 transition-colors">
                Quick View
              </button>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Seller */}
            {product.seller && (
              <div className="flex items-center gap-1 mb-2">
                <TrendingUp className="h-3 w-3 text-brand-500" />
                <span className="text-xs text-muted-foreground">{product.seller}</span>
              </div>
            )}

            {/* Product Name */}
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                {product.reviews && (
                  <span className="text-xs text-muted-foreground">
                    ({product.reviews.toLocaleString()})
                  </span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gradient">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Hover Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              boxShadow: isHovered 
                ? "0 0 30px rgba(168, 85, 247, 0.3)" 
                : "0 0 0px rgba(168, 85, 247, 0)"
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </Link>
    </motion.div>
  );
};

export default PremiumProductCard;
