import ProductCard from "@/components/ProductCard";
import { useProductsQuery } from "@/hooks/useProductsQuery";

const FeaturedProducts = () => {
  const { data: products = [], isLoading, isError } = useProductsQuery();
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Featured Products</h2>
        <a href="/search" className="text-sm text-primary hover:underline">View all</a>
      </div>
      
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {isError && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
          Failed to load featured products. Please try again later.
        </div>
      )}

      {!isLoading && !isError && products.length === 0 && (
        <div className="text-center text-muted-foreground py-12">
          No featured products available at the moment.
        </div>
      )}

      {!isLoading && !isError && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {products.slice(0, 6).map((product, i) => (
            <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;
