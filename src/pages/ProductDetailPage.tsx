import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, ChevronRight, Minus, Plus, Heart, Shield, Truck, RotateCcw, Share2 } from "lucide-react";
import { useState } from "react";
import { useProductsQuery } from "@/hooks/useProductsQuery";
import { useCartStore } from "@/store/cartStore";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import ProductCard from "@/components/ProductCard";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetailPage = () => {
  const { id } = useParams();
  const { data: products = [] } = useProductsQuery();
  const product = products.find((p) => String(p.id) === id);
  const addItem = useCartStore((s) => s.addItem);
  const { currency, locale } = useRegionStore();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [isFav, setIsFav] = useState(false);

  if (!product) {
    return (
      <div className="container-premium py-20 text-center">
        <div className="max-w-md mx-auto">
          <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
            <span className="text-4xl">🔍</span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Product not found</h1>
          <Link to="/" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-foreground text-background font-semibold hover:-translate-y-0.5 transition-all shadow-sm">Back to Home</Link>
        </div>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container-premium py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-foreground transition-colors">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Image ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-3xl overflow-hidden bg-muted/10 border border-border group">
            <motion.img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-smooth"
            />
          </div>
        </motion.div>

        {/* ── Info ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-foreground/80 font-semibold mb-2">{product.seller}</p>
              <h1 className="font-display text-3xl lg:text-4xl font-bold tracking-tight mb-4">{product.name}</h1>
            </div>
            <div className="flex gap-2">
              <motion.button
                className={`p-3 rounded-xl border ${isFav ? 'bg-red-500 border-red-500 text-white' : 'border-border hover:bg-muted/50'} transition-all`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsFav(!isFav)}
              >
                <Heart className={`h-5 w-5 ${isFav ? 'fill-current' : ''}`} />
              </motion.button>
              <motion.button
                className="p-3 rounded-xl border border-border hover:bg-muted/50 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 className="h-5 w-5" />
              </motion.button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm font-semibold">{product.rating}</span>
            <span className="text-sm text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-4xl font-bold text-foreground">{convertAndFormat(product.price, currency, locale)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{convertAndFormat(product.originalPrice, currency, locale)}</span>
                <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-bold">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <div className="mb-8">
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse-subtle" />
                <span className="text-sm text-green-600 dark:text-green-400 font-semibold">In Stock ({product.stock} available)</span>
              </div>
            ) : (
              <span className="text-sm text-destructive font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-8">
            <span className="text-sm font-medium">Quantity</span>
            <div className="flex items-center rounded-xl border border-border overflow-hidden">
              <motion.button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="p-3 hover:bg-muted/50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Minus className="h-4 w-4" />
              </motion.button>
              <span className="px-5 text-sm font-semibold tabular-nums">{qty}</span>
              <motion.button
                onClick={() => setQty(qty + 1)}
                className="p-3 hover:bg-muted/50 transition-colors"
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="h-4 w-4" />
              </motion.button>
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-3 mb-8">
            <motion.button
              onClick={() => { for (let i = 0; i < qty; i++) addItem(product); }}
              className="flex-1 flex items-center justify-center gap-2.5 rounded-2xl bg-foreground px-6 py-4 font-semibold text-background shadow-sm hover:-translate-y-0.5 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </motion.button>
            <motion.button
              className="flex-1 rounded-2xl bg-foreground text-background px-6 py-4 font-semibold hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Buy Now
            </motion.button>
          </div>

          {/* Description */}
          <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "Secure Purchase" },
              { icon: Truck, label: "Free Shipping" },
              { icon: RotateCcw, label: "30-Day Returns" },
            ].map((badge) => (
              <div key={badge.label} className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl bg-muted/30 border border-border/50">
                <badge.icon className="h-5 w-5 text-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div className="mt-16 border-t border-border pt-10">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit mb-8">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${
                activeTab === tab
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="py-4"
          >
            {activeTab === "description" ? (
              <p className="text-muted-foreground leading-relaxed max-w-3xl">{product.description} This premium product is made with high-quality materials ensuring durability and satisfaction. Ships within 2-3 business days with tracking included.</p>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {[5, 4, 3].map((stars) => (
                  <motion.div
                    key={stars}
                    className="p-5 rounded-2xl border border-border bg-card/50"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (5 - stars) * 0.1 }}
                  >
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">Great product! Exactly what I was looking for. Highly recommended.</p>
                    <p className="text-xs text-muted-foreground mt-3 font-medium">Verified Buyer · 3 days ago</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Related ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="font-display text-title font-bold mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
