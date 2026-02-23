import { Users, DollarSign, AlertTriangle, Activity, ShieldCheck } from "lucide-react";

const stats = [
  { label: "GMV", value: "$284,320", change: "+15%", icon: DollarSign },
  { label: "Active Sellers", value: "127", change: "+5", icon: Users },
  { label: "Refund Ratio", value: "1.8%", change: "-0.2%", icon: AlertTriangle },
  { label: "System Health", value: "99.9%", change: "Stable", icon: Activity },
];

const auditLogs = [
  { time: "2 min ago", action: "Seller approved", user: "admin@velora.com", detail: "TechVault Pro" },
  { time: "15 min ago", action: "Commission updated", user: "admin@velora.com", detail: "Electronics: 12% → 10%" },
  { time: "1 hr ago", action: "Order refunded", user: "support@velora.com", detail: "ORD-4521" },
  { time: "3 hr ago", action: "Tenant created", user: "admin@velora.com", detail: "velora-eu" },
];

const AdminDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <span className="flex items-center gap-1 text-sm text-green-600"><ShieldCheck className="h-4 w-4" /> All systems operational</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <s.icon className="h-5 w-5 text-primary" />
              <span className="text-xs font-medium text-green-600">{s.change}</span>
            </div>
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Audit Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Time</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Detail</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l, i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 text-muted-foreground">{l.time}</td>
                  <td className="px-5 py-3 font-medium">{l.action}</td>
                  <td className="px-5 py-3">{l.user}</td>
                  <td className="px-5 py-3">{l.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
