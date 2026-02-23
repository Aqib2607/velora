const SellerPlaceholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
      <p>This section is coming soon.</p>
    </div>
  </div>
);

export const SellerProducts = () => <SellerPlaceholder title="Products" />;
export const SellerOrders = () => <SellerPlaceholder title="Orders" />;
export const SellerAnalytics = () => <SellerPlaceholder title="Analytics" />;
export const SellerPayouts = () => <SellerPlaceholder title="Payouts" />;
export const SellerApiKeys = () => <SellerPlaceholder title="API Keys" />;
