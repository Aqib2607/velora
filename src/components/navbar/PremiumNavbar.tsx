import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, ShoppingCart, User, Bell, Menu, Globe, MapPin, ChevronDown, X, Sparkles } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import ThemeToggle from "../ThemeToggle";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PremiumNavbar = () => {
  const { t } = useTranslation();
  const scrollDirection = useScrollDirection();
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { scrollY } = useScroll();
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Today's Deals", href: "/deals" },
    { label: "Customer Service", href: "/help" },
    { label: "Registry", href: "/registry" },
    { label: "Gift Cards", href: "/gift-cards" },
    { label: "Sell", href: "/sell" },
  ];

  const categories = [
    'Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Toys', 'Automotive'
  ];

  return (
    <motion.header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrollDirection === 'down' && scrolled ? "-translate-y-full" : "translate-y-0"
      )}
    >
      {/* ── Main Navbar ─────────────────────────────── */}
      <nav
        className={cn(
          "mx-auto transition-all duration-500",
          scrolled 
            ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-sm" 
            : "bg-background/90 backdrop-blur-xl border-b border-border"
        )}
      >
        <div className="px-5 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-4 lg:gap-6">
            
            {/* ── Logo ───────────────────────────────── */}
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-11 w-11 rounded-2xl bg-foreground flex items-center justify-center shadow-sm">
                  <span className="text-lg font-black text-background tracking-tight">V</span>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-foreground opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold tracking-tight text-foreground font-display">
                  Velora
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase -mt-0.5">
                  Premium Commerce
                </span>
              </div>
            </Link>

            {/* ── Delivery Location ──────────────────── */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-muted/50 transition-all duration-200 text-sm group">
                <MapPin className="h-4 w-4 text-foreground group-hover:scale-110 transition-transform" />
                <div className="flex flex-col items-start">
                  <span className="text-[10px] text-muted-foreground leading-tight">Deliver to</span>
                  <span className="font-semibold text-xs leading-tight">New York 10001</span>
                </div>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/90 backdrop-blur-xl rounded-xl border-border p-1">
                <DropdownMenuItem className="rounded-lg">Update location</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">View all addresses</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ── Search Bar ─────────────────────────── */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <motion.div
                className="relative w-full"
                animate={{ scale: searchFocused ? 1.02 : 1 }}
                transition={{ duration: 0.2 }}
              >
                <Search className={cn(
                  "absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] transition-colors duration-200",
                  searchFocused ? "text-foreground" : "text-muted-foreground"
                )} />
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Search products, brands, categories..."
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className={cn(
                    "w-full pl-12 pr-5 py-3 rounded-2xl",
                    "bg-muted/40 hover:bg-muted/60",
                    "border border-transparent",
                    "text-sm placeholder:text-muted-foreground/60",
                    "transition-all duration-300",
                    "focus:outline-none focus:bg-background focus:border-foreground/40 focus:ring-4 focus:ring-foreground/10"
                  )}
                />
              </motion.div>
            </div>

            {/* ── Action Buttons ─────────────────────── */}
            <div className="flex items-center gap-1 lg:gap-1.5">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="hidden lg:flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe className="h-[18px] w-[18px]" />
                    <span className="text-xs font-semibold">EN</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background/90 backdrop-blur-xl rounded-xl border-border p-1">
                  <DropdownMenuItem className="rounded-lg">English</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">Español</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">Français</DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications */}
              <motion.button
                className="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-foreground rounded-full ring-2 ring-background animate-pulse-subtle" />
              </motion.button>

              {/* Account */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="h-8 w-8 rounded-xl bg-foreground flex items-center justify-center">
                      <User className="h-4 w-4 text-background" />
                    </div>
                    <div className="hidden lg:flex flex-col items-start">
                      <span className="text-[10px] text-muted-foreground leading-tight">Hello, Sign in</span>
                      <span className="text-xs font-semibold leading-tight">Account & Lists</span>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-background/90 backdrop-blur-xl rounded-xl border-border p-1.5">
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to="/account">Your Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to="/orders">Your Orders</Link>
                  </DropdownMenuItem>
                  <div className="h-px bg-border/50 my-1" />
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to="/seller/dashboard">Seller Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg">
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Returns & Orders */}
              <Link
                to="/info/orders"
                className="hidden lg:flex flex-col items-start px-3 py-2 rounded-xl hover:bg-muted/50 transition-all duration-200"
              >
                <span className="text-[10px] text-muted-foreground leading-tight">Returns</span>
                <span className="text-xs font-semibold leading-tight">& Orders</span>
              </Link>

              {/* Cart */}
              <Link to="/cart">
                <motion.button
                  className="relative p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <motion.span
                    className="absolute -top-0.5 -right-0.5 h-5 w-5 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    3
                  </motion.span>
                </motion.button>
              </Link>

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <motion.button
                    className="md:hidden p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 border-r-0">
                  <SheetHeader className="bg-background border-b border-border p-6 text-foreground">
                    <SheetTitle className="text-foreground text-xl font-display flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4 overflow-y-auto max-h-[calc(100vh-100px)]">
                    {/* Mobile Search */}
                    <div className="px-5 mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                          type="search"
                          placeholder="Search..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/50 border border-border/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30"
                        />
                      </div>
                    </div>
                    <div className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Categories</div>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/category/${cat.toLowerCase()}`}
                        className="flex items-center px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium"
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="h-px bg-border mx-5 my-3" />
                    <div className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Quick Links</div>
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="flex items-center px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* ── Mobile Search ────────────────────────── */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/40 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/30"
              />
            </div>
          </div>
        </div>

        {/* ── Secondary Nav ──────────────────────────── */}
        <div className="hidden lg:block border-t border-border/30">
          <div className="px-5 lg:px-8 py-2.5">
            <div className="flex items-center gap-1">
              {/* All Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <motion.button
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Menu className="h-4 w-4" />
                    All
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] sm:w-[380px] p-0 border-r-0">
                  <SheetHeader className="bg-background border-b border-border p-6 text-foreground">
                    <SheetTitle className="text-foreground text-xl font-display">Browse All</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Trending</div>
                    <Link to="/best-sellers" className="block px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium">Best Sellers</Link>
                    <Link to="/new-releases" className="block px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium">New Releases</Link>
                    <Link to="/movers-shakers" className="block px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium">Movers & Shakers</Link>
                    <div className="h-px bg-border mx-5 my-3" />
                    <div className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">Digital Content</div>
                    <Link to="/velora-music" className="block px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium">Velora Music</Link>
                    <Link to="/velora-prime" className="block px-5 py-3 text-sm hover:bg-muted/50 transition-colors font-medium">Velora Prime</Link>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Divider */}
              <div className="h-4 w-px bg-border/50 mx-1" />

              {/* Quick Links */}
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/30 transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              {/* Divider */}
              <div className="h-4 w-px bg-border/50 mx-1" />

              {/* Categories */}
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category}
                  to={`/category/${category.toLowerCase()}`}
                  className="text-[13px] font-medium text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-muted/30 transition-all duration-200"
                >
                  {category}
                </Link>
              ))}

              {/* Deals Badge */}
              <Link
                to="/deals"
                className="ml-auto flex items-center gap-1.5 text-[13px] font-bold px-3 py-1.5 rounded-full bg-foreground text-background shadow-sm hover:opacity-90 transition-all duration-300"
              >
                <Sparkles className="h-3 w-3" />
                Today's Deals
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default PremiumNavbar;
