import { Link } from "react-router-dom";
import { categories } from "@/data/mock";

const CategoryGrid = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">Shop by Category</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/category/${cat.slug}`}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover-lift hover:border-primary/50 transition-colors animate-fade-in"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <span className="text-3xl">{cat.icon}</span>
            <span className="text-sm font-medium text-center">{cat.name}</span>
            <span className="text-xs text-muted-foreground">{cat.productCount.toLocaleString()}</span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
