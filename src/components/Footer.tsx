import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">V</span>
              </div>
              <span className="text-xl font-bold text-gradient">Velora</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your premium marketplace for quality products from trusted sellers worldwide.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/category/electronics" className="hover:text-primary transition-colors">Electronics</Link></li>
              <li><Link to="/category/fashion" className="hover:text-primary transition-colors">Fashion</Link></li>
              <li><Link to="/category/home-garden" className="hover:text-primary transition-colors">Home & Garden</Link></li>
              <li><Link to="/category/sports" className="hover:text-primary transition-colors">Sports</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Seller</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/seller/dashboard" className="hover:text-primary transition-colors">Seller Central</Link></li>
              <li><Link to="/seller/products" className="hover:text-primary transition-colors">List Products</Link></li>
              <li><Link to="/seller/analytics" className="hover:text-primary transition-colors">Analytics</Link></li>
              <li><Link to="/seller/payouts" className="hover:text-primary transition-colors">Payouts</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2026 Velora. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
