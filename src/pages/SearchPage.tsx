import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mock";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const filtered = query
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">
        {query ? `Results for "${query}"` : "All Products"}
      </h1>
      <p className="text-sm text-muted-foreground mb-6">{filtered.length} products found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No products found matching your search.</p>
      )}
    </div>
  );
};

export default SearchPage;
