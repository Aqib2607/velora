import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Shield, Truck, RotateCcw, HeadphonesIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import PremiumHero from "@/components/PremiumHero";
import PremiumProductCard from "@/components/PremiumProductCard";
import { useProductsQuery } from "@/hooks/useProductsQuery";

// -- Animation Utilities
const fadeInReveal = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
};

export default function PremiumHomePage() {
  const { data: products = [] } = useProductsQuery();
  const targetRef = useRef<HTMLDivElement>(null);
  
  // Subtle parallax for a specific section
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  // Derive products
  const curatedProducts = products.slice(0, 4).map((p, i) => ({
    ...p,
    seller: ["STUDIO NOUVEAU", "ESSENTIALS", "AURA", "MINIMAL"][i],
    badge: i === 0 ? "New Arrival" : i === 3 ? "Limited" : undefined
  }));

  const bentoImages = [
    "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2942&auto=format&fit=crop", // Fashion
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=2940&auto=format&fit=crop", // Home
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2940&auto=format&fit=crop", // Tech
    "https://images.unsplash.com/photo-1627384113743-6bd5a479fffd?q=80&w=2940&auto=format&fit=crop", // Beauty
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white pb-32">
      <PremiumHero />

      {/* ── Editorial Statement ───────────────────────── */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            {...fadeInReveal}
            className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-tight tracking-tight text-neutral-800 dark:text-neutral-200"
          >
            We believe commerce should be beautiful. Every product on Velora is curated for quality, aesthetics, and lasting value.
          </motion.h2>
        </div>
      </section>

      {/* ── Asymmetrical Bento Categories ─────────────── */}
      <section className="px-6 md:px-12 max-w-[1600px] mx-auto py-16">
        <motion.div {...fadeInReveal} className="flex justify-between items-end mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter">
            Collections
          </h2>
          <Link to="/search" className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest uppercase hover:opacity-70 transition-opacity">
            View Directory <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[70vh]">
          {/* Large Left Item */}
          <Link to="/category/fashion" className="group relative block md:col-span-2 rounded-2xl overflow-hidden bg-neutral-100 aspect-square md:aspect-auto">
            <img src={bentoImages[0]} alt="Fashion" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
            <div className="absolute bottom-8 left-8 text-white">
              <h3 className="text-3xl font-display font-bold tracking-tight mb-2">Apparel & Fashion</h3>
              <p className="font-medium tracking-wide">Explore 10,000+ items</p>
            </div>
          </Link>
          
          {/* Right Stack */}
          <div className="grid grid-rows-2 gap-4 h-full md:col-span-1">
            <Link to="/category/home" className="group relative block rounded-2xl overflow-hidden bg-neutral-100 aspect-square md:aspect-auto">
              <img src={bentoImages[1]} alt="Home" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-display font-bold tracking-tight mb-1">Living</h3>
                <p className="text-sm font-medium">Curated spaces</p>
              </div>
            </Link>
            
            <Link to="/category/tech" className="group relative block rounded-2xl overflow-hidden bg-neutral-100 aspect-square md:aspect-auto">
              <img src={bentoImages[2]} alt="Tech" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-display font-bold tracking-tight mb-1">Technology</h3>
                <p className="text-sm font-medium">Latest innovations</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ── The Curated Edit (Featured) ───────────────── */}
      <section className="py-32 px-6 md:px-12 max-w-[1600px] mx-auto overflow-hidden">
        <motion.div {...fadeInReveal} className="mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter mb-4">
            The Curated Edit
          </h2>
          <p className="text-xl text-neutral-500 max-w-2xl">
            Our editors' top picks for this season. Exceptional design meets everyday utility.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {curatedProducts.map((product, index) => (
            <PremiumProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

      {/* ── Platform Capabilities (Stripe Style) ──────── */}
      <section className="py-32 border-y border-neutral-200 dark:border-neutral-900 bg-neutral-50 dark:bg-black overflow-hidden relative" ref={targetRef}>
        <motion.div style={{ y }} className="absolute -right-[20%] top-[10%] opacity-5 w-[800px] h-[800px] rounded-full border border-current pointer-events-none" />
        
        <div className="px-6 md:px-12 max-w-[1600px] mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInReveal}>
              <h2 className="font-display text-5xl md:text-6xl font-bold tracking-tighter leading-[1.1] mb-8">
                A platform engineered for scale.
              </h2>
              <p className="text-xl text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed max-w-lg">
                Whether you're a boutique creator or a global enterprise, Velora provides the financial infrastructure, logistical tools, and beautiful storefronts needed to thrive.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "Global Reach", desc: "Sell in over 135 currencies with automated tax and localization." },
                  { title: "Instant Payouts", desc: "Access your funds immediately with our lightning-fast ledger network." },
                  { title: "Flawless Checkout", desc: "Optimized conversion flows that adapt to user preferences and device." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1">
                      <div className="h-6 w-6 rounded-full bg-foreground flex items-center justify-center">
                        <ArrowRight className="h-3 w-3 text-background" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold tracking-tight">{item.title}</h4>
                      <p className="text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              {...fadeInReveal}
              className="relative aspect-square rounded-3xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl p-8 lg:p-12"
            >
              <div className="w-full h-full border border-neutral-100 dark:border-neutral-800 rounded-2xl flex flex-col relative overflow-hidden bg-neutral-50/50 dark:bg-black/50">
                {/* Mock UI Dashboard */}
                <div className="h-12 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="p-8 flex flex-col gap-6 flex-1">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-sm font-semibold text-neutral-400 uppercase tracking-widest mb-2">Total Revenue</div>
                      <div className="font-display text-4xl font-bold tracking-tight">$428,910.00</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                      +24.5%
                    </div>
                  </div>
                  
                  {/* Mock Chart lines */}
                  <div className="flex-1 flex items-end gap-2 mt-8">
                    {[30, 45, 25, 60, 75, 45, 80, 50, 90, 100].map((h, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.1), duration: 0.8, ease: "easeOut" }}
                        className="flex-1 bg-primary rounded-t-sm"
                        style={{ opacity: 0.3 + (i * 0.07) }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Trust Indicators ──────────────────────────── */}
      <section className="py-24 px-6 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 border-y border-neutral-200 dark:border-neutral-800 py-16">
          {[
            { icon: Shield, title: "Bank-Grade Security", desc: "AES-256 encryption for all data." },
            { icon: Truck, title: "Global Logistics", desc: "Fulfillment in 150+ countries." },
            { icon: RotateCcw, title: "Seamless Returns", desc: "No-questions-asked 30-day policy." },
            { icon: HeadphonesIcon, title: "24/7 Concierge", desc: "Dedicated support team." },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="flex flex-col items-center text-center px-4"
            >
              <item.icon className="h-8 w-8 mb-4 text-foreground stroke-[1.5]" />
              <h4 className="font-semibold tracking-tight text-lg mb-2">{item.title}</h4>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Minimal CTA ───────────────────────────────── */}
      <section className="py-32 px-6">
        <motion.div {...fadeInReveal} className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Ready to scale?
          </h2>
          <div className="flex justify-center gap-4">
            <Link to="/sell">
              <button className="px-8 py-4 rounded-xl bg-foreground text-background font-semibold text-lg tracking-wide hover:scale-105 transition-transform">
                Open Your Store
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
