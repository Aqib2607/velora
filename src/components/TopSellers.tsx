import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { sellers } from "@/data/mock";

const TopSellers = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Top Sellers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {sellers.map((seller, i) => (
          <div
            key={seller.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover-lift animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-primary-foreground">{seller.name[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate">{seller.name}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-accent text-accent" />
                <span className="text-xs text-muted-foreground">{seller.rating} · {seller.productCount} products</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TopSellers;
