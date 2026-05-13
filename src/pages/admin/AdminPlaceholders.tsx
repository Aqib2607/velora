import { useState } from "react";
import { Search, Shield, ShieldCheck, ShieldAlert, Eye, CheckCircle, XCircle, Users, ShoppingCart, Percent, FileText, Building, Activity, Download, Filter, ChevronDown, Globe, ToggleLeft, BarChart3, AlertTriangle, Cpu, Database, Zap } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";

// ──── Admin Sellers ───────────────────────────────────────
const mockSellers = [
  { id: 1, name: "TechVault Pro", email: "hello@techvault.com", status: "active", revenue: 42150, orders: 312, refundRate: 1.2, joined: "2026-01-15", kycStatus: "verified" },
  { id: 2, name: "GreenLeaf Organics", email: "info@greenleaf.com", status: "active", revenue: 28340, orders: 198, refundRate: 0.8, joined: "2026-02-01", kycStatus: "verified" },
  { id: 3, name: "HomeStyle Crafts", email: "craft@homestyle.io", status: "pending", revenue: 0, orders: 0, refundRate: 0, joined: "2026-05-12", kycStatus: "pending" },
  { id: 4, name: "FitGear Athletics", email: "sales@fitgear.co", status: "suspended", revenue: 15200, orders: 89, refundRate: 4.5, joined: "2026-03-10", kycStatus: "flagged" },
  { id: 5, name: "DigitalDreams", email: "hello@dd.store", status: "pending", revenue: 0, orders: 0, refundRate: 0, joined: "2026-05-13", kycStatus: "pending" },
];
const sellerStatusColor: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300", pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300", suspended: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" };
const kycColor: Record<string, string> = { verified: "text-green-600", pending: "text-yellow-600", flagged: "text-red-600" };

export const AdminSellers = () => {
  const [filter, setFilter] = useState("all");
  const { currency, locale } = useRegionStore();
  const filtered = mockSellers.filter(s => filter === "all" || s.status === filter);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><Users className="h-6 w-6" /> Seller Management</h1><span className="text-sm px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">{mockSellers.filter(s => s.status === "pending").length} Pending Approval</span></div>
      <div className="flex gap-2">{["all", "active", "pending", "suspended"].map(s => (<button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>{s === "all" ? "All Sellers" : s}</button>))}</div>
      <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Seller</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Revenue</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Orders</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Refund %</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">KYC</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
        <tbody>{filtered.map(s => (<tr key={s.id} className="border-t border-border hover:bg-muted/50 transition-colors"><td className="px-5 py-3"><div><p className="font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.email}</p></div></td><td className="px-5 py-3 font-medium">{convertAndFormat(s.revenue, currency, locale)}</td><td className="px-5 py-3">{s.orders}</td><td className="px-5 py-3"><span className={s.refundRate > 3 ? "text-red-600 font-medium" : ""}>{s.refundRate}%</span></td><td className="px-5 py-3"><span className={`text-xs font-medium capitalize flex items-center gap-1 ${kycColor[s.kycStatus]}`}>{s.kycStatus === "verified" ? <ShieldCheck className="h-3 w-3" /> : s.kycStatus === "flagged" ? <ShieldAlert className="h-3 w-3" /> : <Shield className="h-3 w-3" />}{s.kycStatus}</span></td><td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${sellerStatusColor[s.status]}`}>{s.status}</span></td><td className="px-5 py-3"><div className="flex gap-1">{s.status === "pending" && <><button className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700">Approve</button><button className="text-xs px-2 py-1 rounded bg-red-600 text-white hover:bg-red-700">Reject</button></>}<button className="p-1.5 rounded hover:bg-muted"><Eye className="h-4 w-4" /></button></div></td></tr>))}</tbody>
      </table></div></div>
    </div>
  );
};

// ──── Admin Orders ────────────────────────────────────────
const globalOrders = [
  { id: "ORD-4501", buyer: "John D.", seller: "TechVault Pro", total: 189.97, status: "paid", date: "2026-05-13", dispute: false },
  { id: "ORD-4502", buyer: "Sarah M.", seller: "GreenLeaf", total: 79.99, status: "refund_pending", date: "2026-05-12", dispute: true },
  { id: "ORD-4503", buyer: "Alex W.", seller: "HomeStyle", total: 234.50, status: "delivered", date: "2026-05-11", dispute: false },
  { id: "ORD-4504", buyer: "Emma L.", seller: "FitGear", total: 149.99, status: "disputed", date: "2026-05-10", dispute: true },
  { id: "ORD-4505", buyer: "Mike R.", seller: "TechVault Pro", total: 399.98, status: "paid", date: "2026-05-13", dispute: false },
];

export const AdminOrders = () => {
  const [filter, setFilter] = useState("all");
  const { currency, locale } = useRegionStore();
  const filtered = globalOrders.filter(o => filter === "all" || (filter === "disputes" ? o.dispute : o.status === filter));
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Order Management</h1><div className="flex gap-2 text-sm"><span className="px-3 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">{globalOrders.filter(o => o.dispute).length} Disputes</span><span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">{globalOrders.filter(o => o.status === "refund_pending").length} Refund Pending</span></div></div>
      <div className="flex gap-2 flex-wrap">{["all", "paid", "refund_pending", "disputes", "delivered"].map(s => (<button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filter === s ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}>{s === "all" ? "All" : s.replace("_", " ")}</button>))}</div>
      <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Order</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Buyer</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Seller</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Total</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
        <tbody>{filtered.map(o => (<tr key={o.id} className={`border-t border-border hover:bg-muted/50 transition-colors ${o.dispute ? "bg-red-50/50 dark:bg-red-950/20" : ""}`}><td className="px-5 py-3 font-medium">{o.id}</td><td className="px-5 py-3">{o.buyer}</td><td className="px-5 py-3">{o.seller}</td><td className="px-5 py-3 font-medium">{convertAndFormat(o.total, currency, locale)}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full capitalize ${o.status === "paid" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : o.status === "refund_pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300" : o.status === "disputed" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"}`}>{o.status.replace("_"," ")}</span></td><td className="px-5 py-3"><div className="flex gap-1">{o.status === "refund_pending" && <button className="text-xs px-2 py-1 rounded bg-green-600 text-white">Approve Refund</button>}{o.dispute && <button className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground">Resolve</button>}<button className="p-1.5 rounded hover:bg-muted"><Eye className="h-4 w-4" /></button></div></td></tr>))}</tbody>
      </table></div></div>
    </div>
  );
};

// ──── Admin Commission ────────────────────────────────────
const commissionRules = [
  { id: 1, category: "Electronics", type: "percentage", rate: 10, orders: 521, revenue: 18234 },
  { id: 2, category: "Clothing", type: "percentage", rate: 15, orders: 342, revenue: 9120 },
  { id: 3, category: "Home & Kitchen", type: "percentage", rate: 12, orders: 198, revenue: 5430 },
  { id: 4, category: "Books", type: "percentage", rate: 8, orders: 412, revenue: 3280 },
  { id: 5, category: "Default", type: "percentage", rate: 10, orders: 156, revenue: 4560 },
];

export const AdminCommission = () => {
  const { currency, locale } = useRegionStore();
  const totalCommission = commissionRules.reduce((a, r) => a + r.revenue, 0);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><Percent className="h-6 w-6" /> Commission Management</h1><button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Add Rule</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Total Commission Revenue</p><p className="text-2xl font-bold mt-1">{convertAndFormat(totalCommission, currency, locale)}</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Avg Commission Rate</p><p className="text-2xl font-bold mt-1">{(commissionRules.reduce((a, r) => a + r.rate, 0) / commissionRules.length).toFixed(1)}%</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Active Rules</p><p className="text-2xl font-bold mt-1">{commissionRules.length}</p></div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Category</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Type</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Rate</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Orders</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Revenue</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
        <tbody>{commissionRules.map(r => (<tr key={r.id} className="border-t border-border hover:bg-muted/50 transition-colors"><td className="px-5 py-3 font-medium">{r.category}</td><td className="px-5 py-3 capitalize">{r.type}</td><td className="px-5 py-3 font-semibold">{r.rate}%</td><td className="px-5 py-3">{r.orders.toLocaleString()}</td><td className="px-5 py-3">{convertAndFormat(r.revenue, currency, locale)}</td><td className="px-5 py-3"><button className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">Edit</button></td></tr>))}</tbody>
      </table></div></div>
    </div>
  );
};

// ──── Admin Audit Logs ────────────────────────────────────
const auditEntries = [
  { id: 1, time: "2026-05-13 15:42:01", actor: "admin@velora.com", action: "seller.approved", entity: "TechVault Pro", ip: "192.168.1.42", device: "Chrome/Windows" },
  { id: 2, time: "2026-05-13 15:30:12", actor: "admin@velora.com", action: "commission.updated", entity: "Electronics: 12% → 10%", ip: "192.168.1.42", device: "Chrome/Windows" },
  { id: 3, time: "2026-05-13 14:55:33", actor: "support@velora.com", action: "refund.approved", entity: "ORD-4521 ($89.99)", ip: "10.0.0.15", device: "Firefox/macOS" },
  { id: 4, time: "2026-05-13 12:10:05", actor: "admin@velora.com", action: "tenant.created", entity: "velora-eu", ip: "192.168.1.42", device: "Chrome/Windows" },
  { id: 5, time: "2026-05-13 11:22:44", actor: "system", action: "payout.processed", entity: "PAY-301 ($4,250.00)", ip: "—", device: "System/Cron" },
  { id: 6, time: "2026-05-12 23:15:08", actor: "admin@velora.com", action: "user.suspended", entity: "FitGear Athletics", ip: "192.168.1.42", device: "Chrome/Windows" },
];
const actionColors: Record<string, string> = { "seller.approved": "text-green-600", "refund.approved": "text-yellow-600", "user.suspended": "text-red-600", "commission.updated": "text-blue-600", "tenant.created": "text-purple-600", "payout.processed": "text-green-600" };

export const AdminAuditLogs = () => {
  const [search, setSearch] = useState("");
  const filtered = auditEntries.filter(e => e.action.includes(search.toLowerCase()) || e.actor.includes(search.toLowerCase()) || e.entity.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><FileText className="h-6 w-6" /> Audit Logs</h1><button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"><Download className="h-4 w-4" /> Export</button></div>
      <div className="flex gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by action, actor, or entity..." className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div></div>
      <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Timestamp</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actor</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Action</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Entity</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">IP</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Device</th></tr></thead>
        <tbody>{filtered.map(e => (<tr key={e.id} className="border-t border-border hover:bg-muted/50 transition-colors"><td className="px-5 py-3 font-mono text-xs text-muted-foreground">{e.time}</td><td className="px-5 py-3 text-sm">{e.actor}</td><td className="px-5 py-3"><span className={`text-xs font-mono font-medium ${actionColors[e.action] || ""}`}>{e.action}</span></td><td className="px-5 py-3 font-medium">{e.entity}</td><td className="px-5 py-3 font-mono text-xs text-muted-foreground">{e.ip}</td><td className="px-5 py-3 text-xs text-muted-foreground">{e.device}</td></tr>))}</tbody>
      </table></div><div className="p-4 border-t border-border text-sm text-muted-foreground text-center">Showing {filtered.length} entries</div></div>
    </div>
  );
};

// ──── Admin Tenants ───────────────────────────────────────
const mockTenants = [
  { id: 1, name: "Velora US", slug: "velora-us", region: "North America", plan: "enterprise", sellers: 127, status: "active", gmv: 284320 },
  { id: 2, name: "Velora EU", slug: "velora-eu", region: "Europe", plan: "enterprise", sellers: 89, status: "active", gmv: 196240 },
  { id: 3, name: "Velora BD", slug: "velora-bd", region: "South Asia", plan: "standard", sellers: 45, status: "active", gmv: 52100 },
  { id: 4, name: "Velora Test", slug: "velora-test", region: "—", plan: "free", sellers: 2, status: "inactive", gmv: 0 },
];

export const AdminTenants = () => {
  const { currency, locale } = useRegionStore();
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold flex items-center gap-2"><Building className="h-6 w-6" /> Tenant Management</h1><button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create Tenant</button></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{mockTenants.filter(t => t.status === "active").map(t => (
        <div key={t.id} className="rounded-xl border border-border bg-card p-5 hover-lift"><div className="flex items-center justify-between mb-3"><span className="font-semibold">{t.name}</span><span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">{t.plan}</span></div><div className="space-y-1 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>{t.region}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Sellers</span><span>{t.sellers}</span></div><div className="flex justify-between"><span className="text-muted-foreground">GMV</span><span className="font-medium">{convertAndFormat(t.gmv, currency, locale)}</span></div></div></div>
      ))}</div>
      <div className="rounded-xl border border-border bg-card overflow-hidden"><div className="p-5 border-b border-border font-semibold">All Tenants</div><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Slug</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Region</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Plan</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th><th className="text-left px-5 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
        <tbody>{mockTenants.map(t => (<tr key={t.id} className="border-t border-border hover:bg-muted/50 transition-colors"><td className="px-5 py-3 font-medium">{t.name}</td><td className="px-5 py-3 font-mono text-xs">{t.slug}</td><td className="px-5 py-3">{t.region}</td><td className="px-5 py-3 capitalize">{t.plan}</td><td className="px-5 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${t.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>{t.status}</span></td><td className="px-5 py-3"><button className="text-xs px-2 py-1 rounded border border-border hover:bg-muted">Configure</button></td></tr>))}</tbody>
      </table></div></div>
    </div>
  );
};
