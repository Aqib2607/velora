import { Gift, CreditCard } from "lucide-react";

const GiftCardPage = () => {
  return (
    <div className="container-premium py-8 lg:py-16 text-center max-w-2xl">
      <div className="h-20 w-20 bg-foreground text-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
        <Gift className="h-10 w-10" />
      </div>
      <h1 className="font-display text-4xl font-bold mb-4 tracking-tight">Give the Gift of Choice</h1>
      <p className="text-lg text-muted-foreground mb-10">Purchase a Velora digital gift card. Instantly delivered via email, perfect for any occasion.</p>
      
      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {[25, 50, 100, 200, 500].map(amount => (
            <button key={amount} className="px-6 py-3 rounded-xl border-2 border-border font-bold text-lg hover:border-foreground hover:bg-foreground/5 transition-all">
              ${amount}
            </button>
          ))}
        </div>
        
        <div className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium mb-1.5">Recipient Email</label>
            <input type="email" placeholder="friend@example.com" className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Personal Message (Optional)</label>
            <textarea rows={3} placeholder="Happy Birthday!" className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-foreground/10 outline-none resize-none" />
          </div>
        </div>

        <button className="w-full mt-8 py-4 rounded-xl bg-foreground text-background font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm">
          <CreditCard className="h-5 w-5" /> Purchase Gift Card
        </button>
      </div>
    </div>
  );
};

export default GiftCardPage;
