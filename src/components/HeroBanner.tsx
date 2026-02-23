import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="Velora marketplace" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>
      <div className="container mx-auto px-4 relative">
        <div className="py-20 md:py-32 max-w-xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in">
            Discover <span className="text-gradient">Premium</span> Products
          </h1>
          <p className="mt-4 text-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Shop from thousands of trusted sellers with exclusive deals and fast shipping.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Link
              to="/category/electronics"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/seller/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium hover:bg-muted transition-colors"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
