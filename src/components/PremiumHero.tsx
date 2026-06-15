import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const PremiumHero = () => {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background pt-32 pb-20">
      {/* ── Minimal Background Grid ───────────────────── */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem'
        }}
      />
      
      {/* ── Content ──────────────────────────────────── */}
      <div className="relative z-10 container-premium flex flex-col items-center text-center">
        
        {/* Minimal Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 px-4 py-1.5 text-xs font-semibold tracking-widest uppercase text-neutral-600 dark:text-neutral-400 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Velora Infrastructure V6
          </span>
        </motion.div>

        {/* Massive Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-[clamp(3.5rem,8vw,8rem)] font-bold tracking-tighter leading-[0.95] text-foreground max-w-6xl mx-auto mb-10"
        >
          The financial infrastructure for <br className="hidden md:block" />
          <span className="text-neutral-400 dark:text-neutral-600">global commerce.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-[clamp(1.125rem,2vw,1.5rem)] text-neutral-500 dark:text-neutral-400 max-w-3xl mx-auto mb-16 leading-relaxed font-medium"
        >
          A high-performance marketplace engine engineered for enterprise brands. Scale globally with institutional-grade security, instant settlements, and a curated network of elite buyers.
        </motion.p>

        {/* CTA Buttons (High Contrast, Flat) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
        >
          <Link to="/search" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-foreground text-background font-semibold text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
              Explore the Network
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link to="/sell" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-transparent text-foreground border border-neutral-200 dark:border-neutral-800 font-semibold text-lg tracking-wide hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
              Deploy your Store
            </button>
          </Link>
        </motion.div>
      </div>

      {/* ── Large Hero Image Placeholder ──────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-7xl mx-auto px-6 mt-24 relative z-10"
      >
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 relative shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2940&auto=format&fit=crop" 
            alt="Commerce Platform" 
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent mix-blend-overlay" />
        </div>
      </motion.div>
    </section>
  );
};

export default PremiumHero;
