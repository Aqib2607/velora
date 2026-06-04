import { BarChart3, Package, DollarSign, AlertTriangle, TrendingUp, RefreshCw, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useSellerStats, useSellerOrders } from "@/hooks/useSellerDashboard";
import type { SellerOrder } from "@/hooks/useSellerDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

// ── Status badge ───────────────────────────────────────────
const statusBadge = (status: string) => {
    const cls = {
        paid       : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        processing : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
        shipped    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20",
        delivered  : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        cancelled  : "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
        refunded   : "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20",
    }[status] ?? "bg-muted text-muted-foreground ring-border";
    return <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1 ${cls}`}>{status}</span>;
};

// ── Skeleton card ──────────────────────────────────────────
const SkeletonCard = () => (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-1/2 bg-muted rounded-lg mb-4" />
        <div className="h-8 w-3/4 bg-muted rounded-lg" />
    </div>
);

const SellerDashboard = () => {
    const { currency, locale } = useRegionStore();
    const stats = useSellerStats();
    const orders = useSellerOrders({ page: 1 });

    const statCards = stats.data
        ? [
            {
                label: "Revenue",
                value: convertAndFormat(stats.data.revenue, currency, locale),
                icon : DollarSign,
                trend: "+12.5%",
                trendUp: true,
            },
            {
                label: "Orders",
                value: stats.data.orders.toLocaleString(),
                icon : Package,
                trend: "+8.2%",
                trendUp: true,
            },
            {
                label: "Refund Rate",
                value: `${stats.data.refund_rate}%`,
                icon : AlertTriangle,
                trend: stats.data.refund_rate > 5 ? "+2.1%" : "-0.5%",
                trendUp: stats.data.refund_rate > 5,
            },
            {
                label: "Active Products",
                value: stats.data.active_products.toLocaleString(),
                icon : BarChart3,
                trend: "+3",
                trendUp: true,
            },
        ]
        : [];

    // ── Recent orders ───────────────────────────────────────
    const recentOrders: SellerOrder[] =
        (orders.data as { data: SellerOrder[] } | undefined)?.data?.slice(0, 5) ?? [];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning";
        if (hour < 17) return "Good afternoon";
        return "Good evening";
    };

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">{getGreeting()} 👋</h1>
                    <p className="text-sm text-muted-foreground mt-1">Your real-time performance overview</p>
                </motion.div>
                <div className="flex items-center gap-2">
                    <motion.button
                        onClick={() => { stats.refetch(); orders.refetch(); }}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-muted/50 transition-all flex items-center gap-2 font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        title="Refresh data"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${stats.isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                    <Link
                        to="/seller/products"
                        className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 shadow-sm transition-all flex items-center gap-2"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Product
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            {stats.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : stats.isError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                    Failed to load stats. {stats.error?.message}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((s, i) => (
                        <motion.div
                            key={s.label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="rounded-2xl border border-border bg-card p-6 hover:shadow-sm transition-all duration-300"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`h-10 w-10 rounded-xl bg-foreground flex items-center justify-center shadow-sm`}>
                                    <s.icon className="h-5 w-5 text-background" />
                                </div>
                                <span className={`flex items-center gap-1 text-xs font-semibold ${s.trendUp ? 'text-green-600' : 'text-red-500'}`}>
                                    {s.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {s.trend}
                                </span>
                            </div>
                            <p className="text-2xl font-bold font-display">{s.value}</p>
                            <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Chart — Revenue Trend */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-foreground" /> Sales Trend
                    </h2>
                    <span className="text-xs font-medium text-muted-foreground px-3 py-1.5 bg-muted/50 rounded-lg">Last 12 months</span>
                </div>
                <Link to="/seller/analytics" className="block">
                    <div className="h-48 flex items-end gap-2 cursor-pointer group">
                        {[40, 65, 55, 80, 70, 90, 85, 95, 75, 88, 92, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                className="flex-1 rounded-t-lg bg-muted group-hover:bg-foreground transition-all duration-300"
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
                            />
                        ))}
                    </div>
                </Link>
                <p className="text-xs text-center text-muted-foreground mt-3">
                    Click to view detailed analytics →
                </p>
            </motion.div>

            {/* Recent Orders */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="font-display font-semibold text-lg">Recent Orders</h2>
                    <Link to="/seller/orders" className="text-xs text-foreground font-semibold underline transition-colors">View all →</Link>
                </div>

                {orders.isLoading ? (
                    <div className="p-6 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : recentOrders.length === 0 ? (
                    <div className="p-16 text-center text-muted-foreground text-sm">
                        No orders yet. Share your products to get started!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/30">
                                <tr>
                                    <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Order</th>
                                    <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Buyer</th>
                                    <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                                    <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                    <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((o) => (
                                    <tr key={o.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold">{o.order_number}</td>
                                        <td className="px-6 py-4 font-medium">{o.user?.name ?? '—'}</td>
                                        <td className="px-6 py-4 font-semibold">{convertAndFormat(o.total, currency, locale)}</td>
                                        <td className="px-6 py-4">{statusBadge(o.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs">
                                            {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SellerDashboard;
