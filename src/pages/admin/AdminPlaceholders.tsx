const AdminPlaceholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <div className="rounded-xl border border-border bg-card p-12 text-center text-muted-foreground">
      <p>This section is coming soon.</p>
    </div>
  </div>
);

export const AdminSellers = () => <AdminPlaceholder title="Sellers" />;
export const AdminOrders = () => <AdminPlaceholder title="Orders" />;
export const AdminCommission = () => <AdminPlaceholder title="Commission" />;
export const AdminAuditLogs = () => <AdminPlaceholder title="Audit Logs" />;
export const AdminTenants = () => <AdminPlaceholder title="Tenants" />;
