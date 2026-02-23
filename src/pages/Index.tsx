import HeroBanner from "@/components/HeroBanner";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import TopSellers from "@/components/TopSellers";
import TrustBadges from "@/components/TrustBadges";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mock";

const Index = () => {
  return (
    <>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      {/* Deals Row */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Today's Deals</h2>
          <a href="/search" className="text-sm text-primary hover:underline">See all deals</a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.filter(p => p.originalPrice).map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
      <TopSellers />
      <TrustBadges />
    </>
  );
};

export default Index;
