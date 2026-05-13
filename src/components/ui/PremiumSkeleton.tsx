import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumSkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  animation?: "pulse" | "shimmer";
}

const PremiumSkeleton = ({
  className,
  variant = "rectangular",
  animation = "shimmer",
}: PremiumSkeletonProps) => {
  const baseStyles = "bg-muted/50 overflow-hidden";

  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "rounded-xl",
    card: "rounded-2xl aspect-[4/5]",
  };

  const animations = {
    pulse: {
      animate: {
        opacity: [0.5, 1, 0.5],
      },
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
    shimmer: {
      animate: {},
      transition: {},
    },
  };

  return (
    <motion.div
      className={cn(baseStyles, variants[variant], className)}
      {...animations[animation]}
    >
      {animation === "shimmer" && (
        <motion.div
          className="h-full w-full shimmer"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </motion.div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="rounded-2xl border border-border p-4 space-y-4">
      <PremiumSkeleton variant="card" />
      <div className="space-y-2">
        <PremiumSkeleton variant="text" className="w-3/4" />
        <PremiumSkeleton variant="text" className="w-1/2" />
        <PremiumSkeleton variant="text" className="w-1/4" />
      </div>
    </div>
  );
};

// Grid Skeleton
export const ProductGridSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default PremiumSkeleton;
