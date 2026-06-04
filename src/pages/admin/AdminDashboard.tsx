import { Users, DollarSign, AlertTriangle, Activity, ShieldCheck, RefreshCw, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useAdminStats, useAuditLogs, type AuditLog } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const SkeletonCard = () => (
    <div className="rounded-2xl border border-border bg-card p-6 animate-pulse">
        <div className="h-4 w-1/2 bg-muted rounded-lg mb-4" />
        <div className="h-8 w-3/4 bg-muted rounded-lg" />
    </div>
);

const AdminDashboard = () => {
    const { currency, locale }    = useRegionStore();
    const stats                   = useAdminStats();
    const auditFeed               = useAuditLogs({ page: 1 });

    const auditLogs: AuditLog[]   = (auditFeed.data as { data: AuditLog[] } | undefined)?.data?.slice(0, 10) ?? [];

    const statCards = stats.data ? [
        { label: "GMV",              value: convertAndFormat(stats.data.total_revenue, currency, locale), icon: DollarSign, trend: "+15.2%", trendUp: true },
        { label: "Active Sellers",   value: stats.data.active_sellers.toLocaleString(), icon: Users, trend: "+23", trendUp: true },
        { label: "Refund Ratio",     value: `${stats.data.refund_rate}%`, icon: AlertTriangle, trend: stats.data.refund_rate > 5 ? "+0.8%" : "-0.3%", trendUp: stats.data.refund_rate > 5 },
        { label: "System Health",    value: "99.9%", icon: Activity, trend: "Stable", trendUp: true },
    ] : [];

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-sm text-muted-foreground mt-1">Platform operations overview</p>
                </motion.div>
                <div className="flex items-center gap-3">
                    <motion.button
                        onClick={() => { stats.refetch(); auditFeed.refetch(); }}
                        className="rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2 font-medium transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${stats.isFetching ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                    <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium px-4 py-2.5 bg-green-500/10 rounded-xl ring-1 ring-green-500/20">
                        <ShieldCheck className="h-4 w-4" /> All systems operational
                    </span>
                </div>
            </div>

            {/* Pending sellers alert */}
            {stats.data && stats.data.pending_sellers > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl bg-muted/50 border border-border p-5 flex items-center justify-between"
                >
                    <p className="text-sm text-foreground font-semibold flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {stats.data.pending_sellers} seller application{stats.data.pending_sellers !== 1 ? 's' : ''} awaiting review
                    </p>
                    <a href="/admin/sellers" className="text-xs text-background hover:opacity-90 font-semibold px-4 py-2 rounded-lg bg-foreground transition-colors">
                        Review →
                    </a>
                </motion.div>
            )}

            {/* KPI Cards */}
            {stats.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : stats.isError ? (
                <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                    Failed to load dashboard statistics. Check your admin permissions.
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

            {/* Orders Today highlight */}
            {stats.data && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                        { label: "Orders Today", value: stats.data.orders_today, color: "text-foreground" },
                        { label: "Total Orders", value: stats.data.total_orders.toLocaleString(), color: "text-foreground" },
                        { label: "Pending Sellers", value: stats.data.pending_sellers, color: "text-muted-foreground" },
                    ].map((item, i) => (
                        <motion.div
                            key={item.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                            className="rounded-2xl border border-border bg-card p-6"
                        >
                            <p className="text-sm text-muted-foreground">{item.label}</p>
                            <p className={`text-3xl font-bold font-display mt-2 ${item.color}`}>{item.value}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Live Audit Log */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="font-display font-semibold text-lg">Live Audit Feed</h2>
                    {auditFeed.isFetching && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg">
                            <RefreshCw className="h-3 w-3 animate-spin" /> Refreshing…
                        </span>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Time</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditFeed.isLoading
                                ? Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="border-t border-border animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-40" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-32" /></td>
                                    </tr>
                                ))
                                : auditLogs.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                                            No audit log entries yet.
                                        </td>
                                    </tr>
                                )
                                : auditLogs.map((log) => (
                                    <tr key={log.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 text-muted-foreground text-xs whitespace-nowrap font-medium">
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{log.action}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {log.user?.email ?? `User #${log.user_id}`}
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;
