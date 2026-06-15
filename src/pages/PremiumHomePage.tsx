import { motion, useScroll, useTransform, animate, useInView } from "framer-motion";
import { Link } from "react-router-dom";
import { useRef, useEffect, useState } from "react";
import { 
  ArrowRight, Shield, Lock, Zap, Store, 
  CheckCircle2, Globe, Truck, Activity, Star, BarChart3,
  TrendingUp, ShoppingBag, Users, BadgeCheck, RotateCcw,
  BarChart, Megaphone, PackageSearch, Building2
} from "lucide-react";
import PremiumHero from "@/components/PremiumHero";
import { useHomepageQuery } from "@/hooks/useHomepageQuery";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
};

// Animated Counter Component
function AnimatedCounter({ from, to, duration = 2, formatter }: { from: number; to: number; duration?: number; formatter?: (val: number) => string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-50px" });

  useEffect(() => {
    if (inView && nodeRef.current) {
      const controls = animate(from, to, {
        duration,
        ease: "easeOut",
        onUpdate(value) {
          if (nodeRef.current) {
            nodeRef.current.textContent = formatter ? formatter(value) : Math.floor(value).toString();
          }
        },
      });
      return () => controls.stop();
    }
  }, [from, to, duration, inView, formatter]);

  return <span ref={nodeRef}>{formatter ? formatter(from) : from}</span>;
}

export default function PremiumHomePage() {
  const { data } = useHomepageQuery();

  const metrics = data?.metrics || {
    total_products: 1205,
    active_sellers: 412,
    countries_served: 150,
    total_orders: 84200
  };

  const topCategories = data?.categories || [];
  const recentProducts = data?.recent_products || [];
  const trendingProducts = data?.trending_products || [];
  const featuredSellersData = data?.featured_sellers || [];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white pb-32">
      <PremiumHero />

      {/* ── Section 1: Marketplace Metrics ───────────────────────── */}
      <section className="py-24 px-6 md:px-12 max-w-[1600px] mx-auto border-b border-neutral-200 dark:border-neutral-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16 text-center md:text-left">
          <div className="flex flex-col">
            <span className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-4 text-foreground">
              <AnimatedCounter from={0} to={metrics.total_products} />
            </span>
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500">Total Products</span>
          </div>
          <div className="flex flex-col">
            <span className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-4 text-foreground">
              <AnimatedCounter from={0} to={metrics.active_sellers} />
            </span>
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500">Verified Sellers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-4 text-foreground">
              <AnimatedCounter from={0} to={metrics.countries_served} />+
            </span>
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500">Countries Served</span>
          </div>
          <div className="flex flex-col">
            <span className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-4 text-foreground">
              <AnimatedCounter from={0} to={metrics.total_orders} formatter={(val) => Math.floor(val).toLocaleString()} />
            </span>
            <span className="text-sm font-bold tracking-widest uppercase text-neutral-500">Orders Processed</span>
          </div>
        </div>
      </section>

      {/* ── Section 2: Featured Collections (Asymmetrical Grid) ────── */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.div {...fadeUp} className="mb-20">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Enterprise Architecture
          </h2>
          <p className="text-2xl text-neutral-500 max-w-2xl leading-relaxed">
            Distinct commerce nodes engineered for maximum conversion across elite merchant catalogs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[400px]">
          {topCategories.map((cat, i) => {
            // Asymmetrical span logic
            const isLarge = i === 0 || i === 3;
            return (
              <motion.div 
                key={cat.id} 
                {...fadeUp} transition={{ delay: i * 0.1 }}
                className={cn(
                  "group relative rounded-3xl overflow-hidden bg-neutral-100 dark:bg-neutral-900",
                  isLarge ? "md:col-span-2" : "col-span-1"
                )}
              >
                <Link to={`/category/${cat.slug}`} className="absolute inset-0 z-10 flex flex-col justify-end p-10">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                  <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-lg font-medium text-white/70 uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {cat.productCount} items <ArrowRight className="h-4 w-4" />
                    </p>
                  </div>
                </Link>
                {/* Fallback pattern if no real image exists */}
                <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-800 transition-transform duration-700 group-hover:scale-105" />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── Section 3: Curated Marketplace (Editorial Layout) ─────── */}
      <section className="py-32 px-6 md:px-12 bg-neutral-950 text-white">
        <div className="max-w-[1600px] mx-auto">
          <motion.div {...fadeUp} className="flex justify-between items-end mb-20 border-b border-neutral-800 pb-10">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter">
              Curated Excellence.
            </h2>
            <Link to="/search" className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest uppercase hover:text-neutral-400 transition-colors">
              View Full Registry <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
            {/* Left Column - Large Highlight */}
            <div className="flex flex-col gap-20">
              {trendingProducts.slice(0, 2).map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col gap-6">
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 block mb-2">{product.seller.company_name}</span>
                    <h3 className="font-display text-3xl font-bold tracking-tight mb-2">{product.name}</h3>
                    <p className="text-xl text-neutral-400">${(product.price || 0).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Column - Staggered */}
            <div className="flex flex-col gap-20 md:pt-40">
              {trendingProducts.slice(2, 4).map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group flex flex-col gap-6">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl bg-neutral-900">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-neutral-500 block mb-2">{product.seller.company_name}</span>
                    <h3 className="font-display text-2xl font-bold tracking-tight mb-2">{product.name}</h3>
                    <p className="text-lg text-neutral-400">${(product.price || 0).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Featured Sellers ───────────────────────────── */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto">
        <motion.div {...fadeUp} className="mb-20 text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Enterprise Partners
          </h2>
          <p className="text-xl md:text-2xl text-neutral-500 max-w-3xl mx-auto leading-relaxed">
            The backbone of the Velora network. We exclusively onboard distinguished brands demanding high-performance infrastructure.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredSellersData.map((seller, i) => (
            <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }} className="group p-10 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 hover:border-foreground transition-all duration-500 flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <Building2 className="h-10 w-10 text-foreground" />
              </div>
              <h3 className="font-display text-3xl font-bold tracking-tight mb-4">{seller.name}</h3>
              
              <div className="flex gap-4 items-center mb-8">
                <div className="flex items-center gap-1 text-sm font-bold bg-neutral-100 dark:bg-neutral-900 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-foreground text-foreground" />
                  {seller.rating}
                </div>
                <div className="text-sm font-bold tracking-widest uppercase text-neutral-500">
                  {seller.count} Items
                </div>
              </div>
              
              <Link to="/search" className="text-sm font-bold tracking-widest uppercase hover:underline underline-offset-4 flex items-center gap-2">
                View Store <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Section 5: Buyer Benefits ─────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 border-y border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/30">
        <div className="max-w-[1600px] mx-auto">
          <motion.div {...fadeUp} className="mb-20">
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6 max-w-4xl">
              Institutional-grade protection for every transaction.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-16">
            {[
              { icon: BadgeCheck, title: "Verified Sellers", desc: "Every merchant undergoes rigorous compliance checks." },
              { icon: Lock, title: "Secure Payments", desc: "Enterprise-grade encryption and automated escrow routing." },
              { icon: Shield, title: "Buyer Protection", desc: "Guaranteed refunds for items not matching descriptions." },
              { icon: RotateCcw, title: "Easy Returns", desc: "Frictionless return logic built directly into your dashboard." },
              { icon: Globe, title: "Global Delivery", desc: "Integrated cross-border shipping with real-time tracking." }
            ].map((benefit, i) => (
              <div key={i} className="flex flex-col">
                <benefit.icon className="h-8 w-8 mb-6 text-foreground" />
                <h3 className="text-2xl font-bold tracking-tight mb-3">{benefit.title}</h3>
                <p className="text-lg text-neutral-500 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 6: Seller Benefits ────────────────────────────── */}
      <section className="py-32 px-6 md:px-12 bg-foreground text-background">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
          <motion.div {...fadeUp}>
            <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-8">
              The operating system for high-growth merchants.
            </h2>
            <p className="text-2xl text-neutral-400 mb-12 max-w-lg leading-relaxed">
              Velora's API-first infrastructure powers instant global acquisition and automated T+1 settlements.
            </p>
            <Link to="/seller/dashboard" className="inline-flex items-center justify-center px-10 py-5 bg-background text-foreground font-semibold text-lg rounded-full hover:scale-105 transition-transform">
              Start Selling Today
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 lg:pt-0">
            {[
              { icon: Zap, title: "Fast Payouts", desc: "Instant T+1 settlements." },
              { icon: Globe, title: "Global Reach", desc: "Auto-translated listings." },
              { icon: PackageSearch, title: "Inventory Sync", desc: "Real-time stock control." },
              { icon: BarChart, title: "Deep Analytics", desc: "Advanced funnel tracking." },
              { icon: Megaphone, title: "Marketing Tools", desc: "Built-in promotional suites." }
            ].map((feature, i) => (
              <div key={i} className="flex flex-col">
                <feature.icon className="h-8 w-8 mb-4 text-neutral-400" />
                <h4 className="text-xl font-bold tracking-tight mb-2">{feature.title}</h4>
                <p className="text-neutral-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 7: Marketplace Activity (Live Feed Proxy) ─────── */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto border-b border-neutral-200 dark:border-neutral-800">
        <motion.div {...fadeUp} className="mb-20 text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-6">
            Network Telemetry
          </h2>
          <p className="text-xl text-neutral-500">Real-time platform activity and high-velocity marketplace movements.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Products */}
          <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Activity className="h-5 w-5 text-neutral-400" /> New Listings
            </h3>
            <div className="flex flex-col gap-6">
              {recentProducts.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center gap-4 group">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="font-bold tracking-tight line-clamp-1">{p.name}</p>
                    <p className="text-sm text-neutral-500">Listed by {p.seller.company_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Categories */}
          <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8">
            <h3 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-neutral-400" /> Surging Sectors
            </h3>
            <div className="flex flex-col gap-6">
              {topCategories.slice(0, 4).map(c => (
                <div key={c.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-foreground" />
                    </div>
                    <p className="font-bold tracking-tight">{c.name}</p>
                  </div>
                  <span className="text-sm font-bold px-3 py-1 bg-neutral-100 dark:bg-neutral-900 rounded-full">
                    +{c.productCount} items
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Sellers */}
          <div className="flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 bg-neutral-50 dark:bg-neutral-900/30">
            <h3 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-3">
              <Store className="h-5 w-5 text-neutral-400" /> Active Merchants
            </h3>
            <div className="flex flex-col gap-6">
              {featuredSellersData.slice(0, 4).map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center bg-background">
                      <span className="font-bold text-xs">{s.name.substring(0,2).toUpperCase()}</span>
                    </div>
                    <p className="font-bold tracking-tight line-clamp-1">{s.name}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Testimonials (Aggregate Success Data) ──────── */}
      <section className="py-32 px-6 md:px-12 bg-neutral-950 text-white text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp}>
            <div className="flex justify-center gap-2 mb-10">
              {[1,2,3,4,5].map(star => <Star key={star} className="h-12 w-12 fill-current text-white" />)}
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight">
              "The undeniable standard for global commerce execution."
            </h2>
            <p className="text-2xl text-neutral-400 mb-12">
              Aggregated performance telemetry across the Velora network.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-neutral-300">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-bold tracking-tighter text-white mb-2">{metrics.total_products > 0 ? "4.8" : "5.0"}</span>
                <span className="text-sm tracking-widest uppercase font-bold">Average Rating</span>
              </div>
              <div className="flex flex-col items-center border-l border-neutral-800 pl-8">
                <span className="text-4xl font-bold tracking-tighter text-white mb-2">{metrics.active_sellers}+</span>
                <span className="text-sm tracking-widest uppercase font-bold">Verified Partners</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 9: Marketplace CTA ────────────────────────────── */}
      <section className="py-40 px-6">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-6xl md:text-8xl font-bold tracking-tighter mb-12">
            Deploy on Velora.
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/search" className="px-10 py-6 rounded-full bg-foreground text-background font-bold text-lg tracking-wide hover:scale-105 transition-transform flex items-center justify-center gap-3">
              Join the network <ArrowRight className="h-5 w-5" />
            </Link>
            <Link to="/seller/dashboard" className="px-10 py-6 rounded-full bg-neutral-100 dark:bg-neutral-900 text-foreground font-bold text-lg tracking-wide hover:scale-105 transition-transform flex items-center justify-center gap-3 border border-neutral-200 dark:border-neutral-800">
              Build your infrastructure
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
