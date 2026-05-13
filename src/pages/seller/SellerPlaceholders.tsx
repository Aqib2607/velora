import { useState } from "react";
import { Package, Plus, Search, Filter, MoreVertical, Edit2, Trash2, Eye, Upload, Archive } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";

// ──── Seller Products ─────────────────────────────────────
const mockProducts = [
  { id: 1, name: "Wireless Bluetooth Headphones", sku: "WBH-001", price: 79.99, stock: 145, status: "published", category: "Electronics", image: "🎧" },
  { id: 2, name: "Organic Green Tea Set", sku: "OGT-002", price: 34.99, stock: 89, status: "published", category: "Food & Beverage", image: "🍵" },
  { id: 3, name: "USB-C Fast Charger 65W", sku: "UFC-003", price: 29.99, stock: 320, status: "published", category: "Electronics", image: "🔌" },
  { id: 4, name: "Bamboo Cutting Board Set", sku: "BCB-004", price: 44.99, stock: 0, status: "draft", category: "Kitchen", image: "🪵" },
  { id: 5, name: "Yoga Mat Premium", sku: "YMP-005", price: 59.99, stock: 67, status: "published", category: "Sports", image: "🧘" },
  { id: 6, name: "Smart LED Desk Lamp", sku: "SLD-006", price: 49.99, stock: 12, status: "published", category: "Home", image: "💡" },
];

export const SellerProducts = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { currency, locale } = useRegionStore();
  const filtered = mockProducts.filter(p => (statusFilter === "all" || p.status === statusFilter) && p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"><Upload className="h-4 w-4" /> Bulk Upload</button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"><Plus className="h-4 w-4" /> Add Product</button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="all">All Status</option><option value="published">Published</option><option value="draft">Draft</option></select>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">SKU</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Stock</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>{filtered.map(p => (
              <tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3"><div className="flex items-center gap-3"><span className="text-2xl">{p.image}</span><div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></div></div></td>
                <td className="px-5 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-5 py-3 font-medium">{convertAndFormat(p.price, currency, locale)}</td>
                <td className="px-5 py-3"><span className={p.stock === 0 ? "text-destructive font-medium" : p.stock < 20 ? "text-yellow-600 font-medium" : ""}>{p.stock === 0 ? "Out of stock" : p.stock}</span></td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "published" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{p.status}</span></td>
                <td className="px-5 py-3"><div className="flex gap-1"><button className="p-1.5 rounded hover:bg-muted transition-colors" title="View"><Eye className="h-4 w-4" /></button><button className="p-1.5 rounded hover:bg-muted transition-colors" title="Edit"><Edit2 className="h-4 w-4" /></button><button className="p-1.5 rounded hover:bg-muted transition-colors text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground"><span>Showing {filtered.length} of {mockProducts.length} products</span><div className="flex gap-1"><button className="px-3 py-1 rounded border border-border hover:bg-muted">Previous</button><button className="px-3 py-1 rounded bg-primary text-primary-foreground">1</button><button className="px-3 py-1 rounded border border-border hover:bg-muted">Next</button></div></div>
      </div>
    </div>
  );
};

// ──── Seller Orders ───────────────────────────────────────
const mockOrders = [
  { id: "SO-2001", buyer: "John Doe", items: 3, total: 189.97, status: "processing", date: "2026-05-13", shipBy: "2026-05-15" },
  { id: "SO-2002", buyer: "Sarah Miller", items: 1, total: 79.99, status: "shipped", date: "2026-05-12", shipBy: "2026-05-14" },
  { id: "SO-2003", buyer: "Alex Wong", items: 2, total: 64.98, status: "delivered", date: "2026-05-11", shipBy: "2026-05-13" },
  { id: "SO-2004", buyer: "Emma Lin", items: 1, total: 49.99, status: "refund_requested", date: "2026-05-10", shipBy: "2026-05-12" },
  { id: "SO-2005", buyer: "Mike Ross", items: 4, total: 234.96, status: "processing", date: "2026-05-13", shipBy: "2026-05-15" },
  { id: "SO-2006", buyer: "Lisa Chen", items: 2, total: 109.98, status: "shipped", date: "2026-05-12", shipBy: "2026-05-14" },
];
const statusColors: Record<string, string> = { processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300", delivered: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", refund_requested: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300", cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };

export const SellerOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const { currency, locale } = useRegionStore();
  const filtered = mockOrders.filter(o => statusFilter === "all" || o.status === statusFilter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Orders</h1><div className="flex gap-3 text-sm"><span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">2 Pending</span><span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">1 Refund Request</span></div></div>
      <div className="flex gap-2 flex-wrap">{["all", "processing", "shipped", "delivered", "refund_requested"].map(s => (<button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>{s === "all" ? "All Orders" : s.replace("_", " ")}</button>))}</div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Order</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Buyer</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Items</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Total</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Ship By</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
            <tbody>{filtered.map(o => (
              <tr key={o.id} className="border-t border-border hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3 font-medium">{o.id}</td>
                <td className="px-5 py-3">{o.buyer}</td>
                <td className="px-5 py-3">{o.items}</td>
                <td className="px-5 py-3 font-medium">{convertAndFormat(o.total, currency, locale)}</td>
                <td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[o.status] || ""}`}>{o.status.replace("_", " ")}</span></td>
                <td className="px-5 py-3 text-muted-foreground">{o.shipBy}</td>
                <td className="px-5 py-3"><div className="flex gap-1">{o.status === "processing" && <button className="text-xs px-2 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Ship</button>}{o.status === "refund_requested" && <button className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button>}<button className="p-1.5 rounded hover:bg-muted"><Eye className="h-4 w-4" /></button></div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ──── Seller Analytics ────────────────────────────────────
export const SellerAnalytics = () => {
  const { currency, locale } = useRegionStore();
  const [period, setPeriod] = useState("30d");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const revenueData = [3200, 4100, 3800, 5200, 4900, 6100, 5800, 7200, 6500, 7800, 8100, 9200];
  const maxRev = Math.max(...revenueData);
  const topProducts = [
    { name: "Wireless Bluetooth Headphones", units: 234, revenue: 18685.66 },
    { name: "USB-C Fast Charger 65W", units: 189, revenue: 5668.11 },
    { name: "Yoga Mat Premium", units: 156, revenue: 9358.44 },
    { name: "Smart LED Desk Lamp", units: 98, revenue: 4899.02 },
  ];
  const regions = [
    { name: "United States", pct: 45, revenue: 42120 },
    { name: "Bangladesh", pct: 22, revenue: 20592 },
    { name: "Germany", pct: 15, revenue: 14040 },
    { name: "Others", pct: 18, revenue: 16848 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Analytics</h1><div className="flex gap-1 rounded-lg border border-border p-0.5">{["7d","30d","90d","1y"].map(p => (<button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded text-sm transition-colors ${period === p ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p}</button>))}</div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[{ label: "Revenue", value: convertAndFormat(93600, currency, locale), change: "+18.2%" }, { label: "Orders", value: "1,247", change: "+12.5%" }, { label: "Avg. Order Value", value: convertAndFormat(75.06, currency, locale), change: "+5.1%" }, { label: "Refund Rate", value: "1.8%", change: "-0.4%" }].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-1">{s.value}</p><span className={`text-xs font-medium ${s.change.startsWith("-") ? "text-green-600" : s.change.startsWith("+") ? "text-green-600" : ""}`}>{s.change} vs prev period</span></div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold mb-4">Revenue Trend</h2><div className="h-48 flex items-end gap-2">{revenueData.map((v, i) => (<div key={i} className="flex-1 flex flex-col items-center gap-1"><div className="w-full rounded-t-md gradient-primary transition-all" style={{ height: `${(v / maxRev) * 100}%` }} /><span className="text-[10px] text-muted-foreground">{months[i]}</span></div>))}</div></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border font-semibold">Top Products</div><div className="divide-y divide-border">{topProducts.map(p => (<div key={p.name} className="flex items-center justify-between px-5 py-3"><div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.units} units sold</p></div><p className="font-semibold text-sm">{convertAndFormat(p.revenue, currency, locale)}</p></div>))}</div></div>
        <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border font-semibold">Regional Performance</div><div className="p-5 space-y-4">{regions.map(r => (<div key={r.name}><div className="flex justify-between text-sm mb-1"><span>{r.name}</span><span className="font-medium">{r.pct}%</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-primary rounded-full transition-all" style={{ width: `${r.pct}%` }} /></div></div>))}</div></div>
      </div>
    </div>
  );
};

// ──── Seller Payouts ──────────────────────────────────────
const mockPayouts = [
  { id: "PAY-301", amount: 4250.00, commission: 425.00, net: 3825.00, status: "paid", date: "2026-05-01", method: "Stripe Connect" },
  { id: "PAY-302", amount: 3180.00, commission: 318.00, net: 2862.00, status: "paid", date: "2026-04-15", method: "Stripe Connect" },
  { id: "PAY-303", amount: 5620.00, commission: 562.00, net: 5058.00, status: "processing", date: "2026-05-15", method: "Stripe Connect" },
  { id: "PAY-304", amount: 2890.00, commission: 289.00, net: 2601.00, status: "pending", date: "2026-05-30", method: "Stripe Connect" },
];

export const SellerPayouts = () => {
  const { currency, locale } = useRegionStore();
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Payouts</h1><button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"><Archive className="h-4 w-4" /> Export CSV</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Available Balance</p><p className="text-2xl font-bold mt-1 text-green-600">{convertAndFormat(5058, currency, locale)}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold mt-1">{convertAndFormat(2601, currency, locale)}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Total Earned (YTD)</p><p className="text-2xl font-bold mt-1">{convertAndFormat(14346, currency, locale)}</p></div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border font-semibold">Payout History</div>
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">ID</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Gross</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Commission</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Net Payout</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th></tr></thead>
          <tbody>{mockPayouts.map(p => (<tr key={p.id} className="border-t border-border hover:bg-muted/50 transition-colors"><td className="px-5 py-3 font-mono text-xs">{p.id}</td><td className="px-5 py-3">{convertAndFormat(p.amount, currency, locale)}</td><td className="px-5 py-3 text-destructive">-{convertAndFormat(p.commission, currency, locale)}</td><td className="px-5 py-3 font-semibold">{convertAndFormat(p.net, currency, locale)}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : p.status === "processing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}`}>{p.status}</span></td><td className="px-5 py-3 text-muted-foreground">{p.date}</td></tr>))}</tbody>
        </table></div>
      </div>
    </div>
  );
};

// ──── Seller API Keys / Settings ──────────────────────────
export const SellerApiKeys = () => {
  const [showKey, setShowKey] = useState(false);
  const mockKeys = [
    { name: "Production API Key", key: "vlr_live_sk_a1b2c3d4e5f6g7h8", created: "2026-03-15", lastUsed: "2 hours ago" },
    { name: "Test API Key", key: "vlr_test_sk_z9y8x7w6v5u4t3s2", created: "2026-04-01", lastUsed: "5 days ago" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Settings & API Keys</h1></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-5 border-b border-border font-semibold">Store Profile</div>
          <div className="p-5 space-y-4">
            {[{ label: "Business Name", value: "TechVault Pro" }, { label: "Business Email", value: "hello@techvault.com" }, { label: "Phone", value: "+1 (555) 123-4567" }, { label: "Country", value: "United States" }].map(f => (
              <div key={f.label}><label className="text-xs font-medium text-muted-foreground">{f.label}</label><input defaultValue={f.value} className="w-full mt-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            ))}
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">Save Changes</button>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between"><span className="font-semibold">API Keys</span><button className="text-xs px-3 py-1 rounded-lg bg-primary text-primary-foreground">Generate New Key</button></div>
            <div className="divide-y divide-border">{mockKeys.map(k => (
              <div key={k.name} className="p-5"><div className="flex items-center justify-between mb-2"><span className="font-medium text-sm">{k.name}</span><button onClick={() => setShowKey(!showKey)} className="text-xs text-primary">{showKey ? "Hide" : "Reveal"}</button></div><code className="text-xs bg-muted px-3 py-1.5 rounded block font-mono">{showKey ? k.key : "•".repeat(32)}</code><div className="flex gap-4 mt-2 text-xs text-muted-foreground"><span>Created: {k.created}</span><span>Last used: {k.lastUsed}</span></div></div>
            ))}</div>
          </div>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border font-semibold">Banking Details</div>
            <div className="p-5 space-y-3">
              <div><label className="text-xs font-medium text-muted-foreground">Stripe Connect Status</label><p className="mt-1 text-sm"><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Connected</span></p></div>
              <div><label className="text-xs font-medium text-muted-foreground">Payout Schedule</label><p className="mt-1 text-sm">Bi-weekly (1st & 15th)</p></div>
              <div><label className="text-xs font-medium text-muted-foreground">Tax ID</label><input defaultValue="XX-XXXXXXX" className="w-full mt-1 rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
