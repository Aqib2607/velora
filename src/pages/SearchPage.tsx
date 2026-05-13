import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { Filter, Star, ChevronDown } from "lucide-react";
import api from "@/utils/api";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local filter states
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "relevance");

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const qs = searchParams.toString();
        // Since we don't have openSearch right now, this hits the backend controller we built
        const res = await api.get(`/search?${qs}`);
        // If the backend isn't returning data correctly due to DB connection, fallback to empty
        setResults(res.data?.data?.data || []);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
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
    setSearchParams(newParams);
    setIsFilterOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">{query ? `Results for "${query}"` : "All Products"}</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 text-sm font-medium bg-muted px-3 py-1.5 rounded-lg"
        >
          <Filter className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Filter Sidebar */}
      <aside className={`w-full md:w-64 shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
        <div className="sticky top-24 space-y-6">
          <div className="hidden md:block">
            <h1 className="text-xl font-bold break-words">{query ? `Results for "${query}"` : "All Products"}</h1>
            <p className="text-sm text-muted-foreground mt-1">{results.length} products found</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Sort By</h3>
            <select 
              value={sort} 
              onChange={(e) => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
              className="w-full text-sm border-border bg-background rounded-lg focus:ring-primary"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="rating">Avg. Customer Review</option>
            </select>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Price</h3>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-input rounded bg-background"
              />
              <span className="text-muted-foreground">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-input rounded bg-background"
              />
              <button 
                onClick={applyFilters}
                className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded hover:opacity-90 transition-opacity"
              >
                Go
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold border-b border-border pb-2">Customer Reviews</h3>
            <div className="space-y-2">
              {[4, 3, 2, 1].map(stars => (
                <button 
                  key={stars}
                  onClick={() => { setRating(stars.toString()); setTimeout(applyFilters, 0); }}
                  className={`flex items-center gap-1 text-sm hover:text-primary transition-colors ${rating === stars.toString() ? 'font-bold text-primary' : ''}`}
                >
                  <div className="flex text-[#f1c232]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < stars ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                    ))}
                  </div>
                  <span className="text-muted-foreground ml-1">& Up</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <h2 className="text-lg font-semibold">No results found</h2>
            <p className="text-muted-foreground mt-2">Try checking your spelling or using more general terms.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
