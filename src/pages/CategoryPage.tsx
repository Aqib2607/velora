import { useParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/mock";

const CategoryPage = () => {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);
  const filtered = products.filter((p) =>
    p.category.toLowerCase().replace(/ & /g, "-") === slug
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">{category?.name || slug}</h1>
      <p className="text-sm text-muted-foreground mb-6">{filtered.length} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No products in this category yet.</p>
      )}
    </div>
  );
};

export default CategoryPage;
