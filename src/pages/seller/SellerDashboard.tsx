import { BarChart3, Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Revenue", value: "$12,430", change: "+12%", icon: DollarSign, color: "text-green-600" },
  { label: "Orders", value: "156", change: "+8%", icon: Package, color: "text-primary" },
  { label: "Refund Rate", value: "2.1%", change: "-0.3%", icon: AlertTriangle, color: "text-accent" },
  { label: "Active Products", value: "48", change: "+3", icon: BarChart3, color: "text-secondary" },
];

const recentOrders = [
  { id: "SO-101", buyer: "John D.", total: "$89.99", status: "Processing" },
  { id: "SO-102", buyer: "Sarah M.", total: "$249.99", status: "Shipped" },
  { id: "SO-103", buyer: "Alex W.", total: "$34.99", status: "Delivered" },
  { id: "SO-104", buyer: "Emma L.", total: "$159.99", status: "Processing" },
  { id: "SO-105", buyer: "Mike R.", total: "$79.99", status: "Shipped" },
];

const SellerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <Link to="/seller/products" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 hover-lift">
            <div className="flex items-center justify-between">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-xs font-medium text-green-600">{s.change}</span>
            </div>
            <p className="text-2xl font-bold mt-3">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Sales Trend</h2>
        <div className="h-48 flex items-end gap-2">
          {[40, 65, 55, 80, 70, 90, 85, 95, 75, 88, 92, 100].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md gradient-primary transition-all" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
          <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Order ID</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Buyer</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                  <td className="px-5 py-3 font-medium">{o.id}</td>
                  <td className="px-5 py-3">{o.buyer}</td>
                  <td className="px-5 py-3">{o.total}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${o.status === "Delivered" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : o.status === "Shipped" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
