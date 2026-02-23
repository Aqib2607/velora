import { Shield, Truck, RotateCcw, Headphones } from "lucide-react";

const badges = [
  { icon: Shield, title: "Secure Payments", desc: "256-bit SSL encryption" },
  { icon: Truck, title: "Fast Delivery", desc: "Free shipping over $50" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const TrustBadges = () => {
  return (
    <section className="border-t border-border bg-surface">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col items-center text-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <b.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">{b.title}</h3>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBadges;
