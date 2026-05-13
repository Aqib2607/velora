import { motion } from "framer-motion";
import PremiumHero from "@/components/PremiumHero";
import PremiumProductCard from "@/components/PremiumProductCard";
import { Sparkles, TrendingUp, Zap, Shield, Truck, HeadphonesIcon, RotateCcw, Star } from "lucide-react";
import { products, categories, sellers } from "@/data/mock";
import { Link } from "react-router-dom";

const PremiumHomePage = () => {
  // Mock featured products
  const featuredProducts = products.slice(0, 6).map((p, i) => ({
    ...p,
    badge: i % 3 === 0 ? "Trending" : i % 3 === 1 ? "New" : undefined,
    seller: "Premium Seller",
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 5000) + 100,
  }));

  // Deals products
  const dealsProducts = products.filter(p => p.originalPrice).slice(0, 6).map((p, i) => ({
    ...p,
    badge: "Deal",
    seller: "Top Seller",
    rating: 4.5 + Math.random() * 0.5,
    reviews: Math.floor(Math.random() * 5000) + 100,
  }));

  const categoryIcons = [
    { name: "Electronics", icon: "💻", color: "from-blue-500 to-cyan-500", count: categories.find(c => c.slug === 'electronics')?.productCount || 0 },
    { name: "Fashion", icon: "👔", color: "from-pink-500 to-rose-500", count: categories.find(c => c.slug === 'fashion')?.productCount || 0 },
    { name: "Home & Living", icon: "🏠", color: "from-green-500 to-emerald-500", count: categories.find(c => c.slug === 'home')?.productCount || 0 },
    { name: "Beauty", icon: "💄", color: "from-purple-500 to-pink-500", count: categories.find(c => c.slug === 'beauty')?.productCount || 0 },
    { name: "Sports", icon: "⚽", color: "from-orange-500 to-red-500", count: categories.find(c => c.slug === 'sports')?.productCount || 0 },
    { name: "Books", icon: "📚", color: "from-indigo-500 to-purple-500", count: categories.find(c => c.slug === 'books')?.productCount || 0 },
    { name: "Toys", icon: "🧨", color: "from-yellow-500 to-orange-500", count: 5000 },
    { name: "Automotive", icon: "🚗", color: "from-gray-500 to-slate-500", count: 3000 },
  ];

  const trustBadges = [
    { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
    { icon: Truck, title: "Fast Delivery", desc: "Free shipping over $50" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: HeadphonesIcon, title: "24/7 Support", desc: "Always here to help" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <PremiumHero />

      {/* Categories Section - RESTORED */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Shop by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Discover products across all categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categoryIcons.map((category, index) => (
            <motion.a
              key={category.name}
              href={`/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.05 }}
              className="group relative overflow-hidden rounded-2xl p-6 glass hover:shadow-glass-hover transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
              <div className="relative text-center">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                <span className="text-xs text-muted-foreground">{category.count.toLocaleString()}</span>
              </div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Featured Products - RESTORED */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-bold mb-2">
              <span className="text-gradient">Featured</span> Products
            </h2>
            <p className="text-muted-foreground">
              Handpicked selections just for you
            </p>
          </div>
          <a
            href="/search"
            className="hidden md:flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            View All
            <TrendingUp className="h-5 w-5" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredProducts.map((product, index) => (
            <PremiumProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Today's Deals Section - RESTORED */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl font-bold mb-2">
              Today's <span className="text-gradient">Deals</span>
            </h2>
            <p className="text-muted-foreground">
              Limited time offers you don't want to miss
            </p>
          </div>
          <a
            href="/deals"
            className="hidden md:flex items-center gap-2 text-brand-500 hover:text-brand-600 font-semibold transition-colors"
          >
            See all deals
            <TrendingUp className="h-5 w-5" />
          </a>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dealsProducts.map((product, index) => (
            <PremiumProductCard
              key={product.id}
              product={product}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Top Sellers Section - RESTORED */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-4xl font-bold mb-2">
            Top <span className="text-gradient">Sellers</span>
          </h2>
          <p className="text-muted-foreground">
            Trusted sellers with excellent ratings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sellers.map((seller, i) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="flex items-center gap-4 p-4 rounded-xl glass hover:shadow-glass-hover transition-all"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
                <span className="text-lg font-bold text-white">{seller.name[0]}</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{seller.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-muted-foreground">{seller.rating} · {seller.productCount} products</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust Badges Section - RESTORED */}
      <section className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <motion.div
                  className="h-16 w-16 rounded-2xl bg-gradient-brand flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <badge.icon className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="font-semibold text-base">{badge.title}</h3>
                <p className="text-sm text-muted-foreground">{badge.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - RESTORED */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-brand p-12 md:p-20 text-center text-white"
        >
          {/* Animated Background */}
          <motion.div
            className="absolute inset-0 opacity-30"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "50px 50px",
            }}
          />

          <div className="relative z-10">
            <Sparkles className="h-12 w-12 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Start Selling Today
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of successful sellers on Velora and reach millions of customers worldwide
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sell">
                <motion.button
                  className="px-8 py-4 rounded-xl bg-white text-brand-600 font-semibold text-lg hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Become a Seller
                </motion.button>
              </Link>
              <Link to="/seller/dashboard">
                <motion.button
                  className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm border-2 border-white text-white font-semibold text-lg hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Seller Dashboard
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PremiumHomePage;
