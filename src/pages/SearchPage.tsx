import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PremiumProductCard from "@/components/PremiumProductCard";
import { Filter, Star, SlidersHorizontal, X } from "lucide-react";
import api from "@/utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/types/domain";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const page = parseInt(searchParams.get("page") || "1", 10);
  const [lastPage, setLastPage] = useState(1);

  // Local filter states
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");

  useEffect(() => {
    const fetchResults = async () => {
      if (page === 1) setLoading(true);
      try {
        const qs = searchParams.toString();
        const res = await api.get<any>(`/search?${qs}`);
        const newResults = res.data?.data?.results || [];
        setLastPage(res.data?.data?.last_page || 1);
        
        if (page === 1) {
          setResults(newResults);
        } else {
          setResults(prev => [...prev, ...newResults]);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (page === 1) setResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [searchParams]);

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    if (minPrice) newParams.set("min_price", minPrice); else newParams.delete("min_price");
    if (maxPrice) newParams.set("max_price", maxPrice); else newParams.delete("max_price");
    if (rating) newParams.set("rating", rating); else newParams.delete("rating");
    newParams.set("sort", sort);
    newParams.delete("page"); // Reset to page 1 on filter
    setSearchParams(newParams);
    setIsFilterOpen(false);
  };

  return (
    <div className="container-premium py-8 lg:py-12 flex flex-col md:flex-row gap-8">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center">
        <h1 className="font-display text-xl font-bold">{query ? `Results for "${query}"` : "All Products"}</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 text-sm font-semibold bg-foreground text-background px-4 py-2 rounded-xl shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Filter Sidebar */}
      <aside className={`w-full md:w-72 shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        <div className="sticky top-32 space-y-6">
          <div className="hidden md:block">
            <h1 className="font-display text-2xl font-bold break-words mb-2">{query ? `Results for "${query}"` : "All Products"}</h1>
            <p className="text-sm text-muted-foreground">{results.length} products found</p>
          </div>

          {/* Sort */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Sort By</h3>
            <select 
              value={sort} 
              onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
              className="w-full text-sm border border-input bg-background rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 focus:outline-none transition-all"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Price Range</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-background focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 focus:outline-none transition-all"
              />
              <span className="text-muted-foreground font-medium">—</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-xl bg-background focus:ring-2 focus:ring-foreground/10 focus:border-foreground/30 focus:outline-none transition-all"
              />
            </div>
            <button 
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-xl hover:opacity-90 transition-all shadow-sm"
            >
              Apply
            </button>
          </div>

          {/* Customer Reviews */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold text-sm">Customer Reviews</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(stars => (
                <button 
                  key={stars}
                  onClick={() => { setRating(stars.toString()); setTimeout(applyFilters, 0); }}
                  className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded-xl transition-all ${rating === stars.toString() ? 'bg-foreground/5 text-foreground font-semibold' : 'hover:bg-muted/50'}`}
                >
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3.5 w-3.5 ${i < stars ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-muted-foreground">& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(minPrice || maxPrice || rating) && (
            <button
              onClick={() => {
                setMinPrice(""); setMaxPrice(""); setRating("");
                const newParams = new URLSearchParams();
                if (query) newParams.set("q", query);
                setSearchParams(newParams);
              }}
              className="flex items-center gap-2 text-sm text-destructive hover:underline font-medium px-3"
            >
              <X className="h-3.5 w-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card animate-pulse">
                <div className="aspect-square bg-muted/50 m-2.5 rounded-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-muted rounded-full w-1/3" />
                  <div className="h-4 bg-muted rounded-full w-3/4" />
                  <div className="h-4 bg-muted rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {results.map((product, i) => (
              <PremiumProductCard key={`${product.id}-${i}`} product={product} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 rounded-2xl border border-border bg-card"
          >
            <div className="h-20 w-20 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
              <span className="text-3xl">🔍</span>
            </div>
            <h2 className="font-display text-xl font-bold mb-2">No results found</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Try checking your spelling or using more general terms.</p>
          </motion.div>
        )}

        {page < lastPage && (
          <div className="mt-12 flex justify-center">
            <button 
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set("page", (page + 1).toString());
                setSearchParams(newParams);
              }}
              className="px-8 py-3 rounded-xl border border-border bg-card font-semibold hover:bg-muted/50 transition-all"
            >
              Load More
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
