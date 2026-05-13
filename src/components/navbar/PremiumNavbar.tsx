import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Search, ShoppingCart, User, Bell, Menu, Globe, MapPin, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
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
  const { scrollY } = useScroll();
  
  const navbarOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const navbarBlur = useTransform(scrollY, [0, 100], [12, 20]);

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
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollDirection === 'down' && scrolled ? "-translate-y-full" : "translate-y-0"
      )}
      style={{ opacity: navbarOpacity }}
    >
      {/* Premium Glass Navbar */}
      <motion.nav
        className={cn(
          "mx-auto max-w-[1600px] mt-4 mx-4 rounded-2xl transition-all duration-300",
          scrolled 
            ? "glass shadow-glass" 
            : "bg-background/80 backdrop-blur-sm"
        )}
        style={{
          backdropFilter: scrolled ? `blur(${navbarBlur}px)` : 'blur(8px)',
        }}
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-brand flex items-center justify-center shadow-lg">
                  <span className="text-lg font-bold text-white">V</span>
                </div>
                <motion.div
                  className="absolute inset-0 rounded-xl bg-gradient-brand opacity-0 group-hover:opacity-50 blur-xl transition-opacity"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.5 }}
                />
              </motion.div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold tracking-tight text-gradient">
                  Velora
                </span>
                <span className="text-[10px] text-muted-foreground -mt-1">
                  Premium Commerce
                </span>
              </div>
            </Link>

            {/* Delivery Location - Restored */}
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm">
                <MapPin className="h-4 w-4" />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-muted-foreground">Deliver to</span>
                  <span className="font-semibold">New York 10001</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Update location</DropdownMenuItem>
                <DropdownMenuItem>View all addresses</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Search Bar - Premium */}
            <div className="hidden md:flex flex-1 max-w-2xl">
              <motion.div
                className="relative w-full group"
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <input
                  type="search"
                  placeholder="Search products, brands, categories..."
                  className={cn(
                    "w-full pl-12 pr-4 py-3 rounded-xl",
                    "bg-muted/50 hover:bg-muted/70 focus:bg-background",
                    "border border-border/50 hover:border-primary/50 focus:border-primary",
                    "text-sm placeholder:text-muted-foreground",
                    "transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20"
                  )}
                />
              </motion.div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language - Restored */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Globe className="h-5 w-5" />
                    <span className="text-sm font-medium">EN</span>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>English</DropdownMenuItem>
                  <DropdownMenuItem>Español</DropdownMenuItem>
                  <DropdownMenuItem>Français</DropdownMenuItem>
                  <DropdownMenuItem>Deutsch</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications - Restored */}
              <motion.button
                className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-error rounded-full animate-pulse" />
              </motion.button>

              {/* Account - Restored */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <User className="h-5 w-5" />
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-muted-foreground">Hello, Sign in</span>
                      <span className="text-sm font-semibold">Account & Lists</span>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link to="/account">Your Account</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders">Your Orders</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/seller/dashboard">Seller Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Returns & Orders - Restored */}
              <Link
                to="/info/orders"
                className="hidden md:flex flex-col items-start px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground">Returns</span>
                <span className="text-sm font-semibold">& Orders</span>
              </Link>

              {/* Cart - Restored */}
              <Link to="/cart">
                <motion.button
                  className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <motion.span
                    className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-brand text-white text-xs font-bold rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    3
                  </motion.span>
                </motion.button>
              </Link>

              {/* Mobile Menu - Restored */}
              <Sheet>
                <SheetTrigger asChild>
                  <motion.button
                    className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                  <SheetHeader className="bg-gradient-brand p-4 text-white">
                    <SheetTitle className="text-white text-xl">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="px-6 py-2 font-bold text-lg">Shop by Category</div>
                    {categories.map((cat) => (
                      <Link
                        key={cat}
                        to={`/category/${cat.toLowerCase()}`}
                        className="block px-6 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        {cat}
                      </Link>
                    ))}
                    <div className="border-t border-border my-2"></div>
                    <div className="px-6 py-2 font-bold text-lg">Quick Links</div>
                    {navLinks.map((link) => (
                      <Link
                        key={link.label}
                        to={link.href}
                        className="block px-6 py-3 text-sm hover:bg-muted transition-colors"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile Search - Restored */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className={cn(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
                  "bg-muted/50 border border-border/50",
                  "text-sm placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
          </div>
        </div>

        {/* Secondary Nav - Categories - RESTORED */}
        <div className="hidden lg:block border-t border-border/50">
          <div className="px-6 py-3">
            <div className="flex items-center gap-6">
              {/* All Menu - Restored */}
              <Sheet>
                <SheetTrigger asChild>
                  <motion.button
                    className="flex items-center gap-1 text-sm font-semibold hover:text-brand-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Menu className="h-4 w-4" />
                    All
                  </motion.button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
                  <SheetHeader className="bg-gradient-brand p-4 text-white">
                    <SheetTitle className="text-white text-xl">Browse All</SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <div className="px-6 py-2 font-bold text-lg">Trending</div>
                    <Link to="/best-sellers" className="block px-6 py-3 text-sm hover:bg-muted transition-colors">Best Sellers</Link>
                    <Link to="/new-releases" className="block px-6 py-3 text-sm hover:bg-muted transition-colors">New Releases</Link>
                    <Link to="/movers-shakers" className="block px-6 py-3 text-sm hover:bg-muted transition-colors">Movers & Shakers</Link>
                    <div className="border-t border-border my-2"></div>
                    <div className="px-6 py-2 font-bold text-lg">Digital Content</div>
                    <Link to="/velora-music" className="block px-6 py-3 text-sm hover:bg-muted transition-colors">Velora Music</Link>
                    <Link to="/velora-prime" className="block px-6 py-3 text-sm hover:bg-muted transition-colors">Velora Prime</Link>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Quick Links - Restored */}
              {navLinks.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Categories - Restored */}
              {categories.slice(0, 4).map((category) => (
                <motion.a
                  key={category}
                  href={`/category/${category.toLowerCase()}`}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.a>
              ))}

              {/* Deals Badge - Restored */}
              <motion.a
                href="/deals"
                className="ml-auto text-sm font-semibold text-gradient"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(168, 85, 247, 0)",
                    "0 0 10px rgba(168, 85, 247, 0.5)",
                    "0 0 0px rgba(168, 85, 247, 0)",
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Today's Deals 🔥
              </motion.a>
            </div>
          </div>
        </div>
      </motion.nav>
    </motion.header>
  );
};

export default PremiumNavbar;
