import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingCart, User, Sun, Moon, Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";
import { useState } from "react";

const Header = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const { theme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">V</span>
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">Velora</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            <Link to="/seller/dashboard" className="hidden sm:flex items-center gap-1 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
              Sell
            </Link>

            <Link to="/login" className="p-2 rounded-lg hover:bg-muted transition-colors">
              <User className="h-5 w-5" />
            </Link>

            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center font-bold animate-cart-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileMenuOpen && (
          <div className="pb-4 md:hidden animate-fade-in">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
            <div className="mt-3 flex flex-col gap-1">
              <Link to="/seller/dashboard" className="px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Seller Central</Link>
              <Link to="/admin/dashboard" className="px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Admin</Link>
            </div>
          </div>
        )}
      </div>

      {/* Category Nav */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-4">
          <nav className="flex items-center gap-6 overflow-x-auto py-2 text-sm scrollbar-none">
            {["Electronics", "Fashion", "Home & Garden", "Sports", "Books", "Beauty", "Toys", "Automotive"].map((cat) => (
              <Link
                key={cat}
                to={`/category/${cat.toLowerCase().replace(/ & /g, "-")}`}
                className="whitespace-nowrap text-muted-foreground hover:text-primary transition-colors"
              >
                {cat}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
