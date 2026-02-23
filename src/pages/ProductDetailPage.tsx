import { useParams, Link } from "react-router-dom";
import { Star, ShoppingCart, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { products } from "@/data/mock";
import { useCartStore } from "@/store/cartStore";
import ProductCard from "@/components/ProductCard";

const ProductDetailPage = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/category/${product.category.toLowerCase()}`} className="hover:text-primary">{product.category}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Image */}
        <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>

          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-border"}`} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount.toLocaleString()} reviews)</span>
          </div>

          <p className="text-sm text-muted-foreground mt-2">Sold by <span className="text-primary font-medium">{product.seller}</span></p>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% off
                </span>
              </>
            )}
          </div>

          <div className="mt-4">
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">✓ In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-sm text-destructive font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mt-6">
            <span className="text-sm font-medium">Qty:</span>
            <div className="flex items-center border border-border rounded-lg">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-2 hover:bg-muted transition-colors"><Minus className="h-4 w-4" /></button>
              <span className="px-4 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(qty + 1)} className="p-2 hover:bg-muted transition-colors"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => { for (let i = 0; i < qty; i++) addItem(product); }}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </button>
            <button className="flex-1 rounded-lg gradient-accent px-6 py-3 font-medium text-accent-foreground hover:opacity-90 transition-opacity">
              Buy Now
            </button>
          </div>

          <p className="text-sm text-muted-foreground mt-6 leading-relaxed">{product.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t border-border pt-8">
        <div className="flex gap-6 border-b border-border">
          {(["description", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="py-6">
          {activeTab === "description" ? (
            <p className="text-muted-foreground leading-relaxed">{product.description} This premium product is made with high-quality materials ensuring durability and satisfaction. Ships within 2-3 business days with tracking included.</p>
          ) : (
            <div className="space-y-4">
              {[5, 4, 3].map((stars) => (
                <div key={stars} className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">Great product! Exactly what I was looking for. Highly recommended.</p>
                  <p className="text-xs text-muted-foreground mt-2">Verified Buyer · 3 days ago</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
