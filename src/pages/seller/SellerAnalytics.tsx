import { useState } from "react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useSellerAnalytics } from "@/hooks/useSellerDashboard";
import { DollarSign, ShoppingCart, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export const SellerAnalytics = () => {
    const { currency, locale }         = useRegionStore();
    const [period, setPeriod]          = useState<"7d" | "30d" | "90d" | "12m">("30d");
    const { data, isLoading, isError } = useSellerAnalytics(period);

    const dailyData = data?.daily_revenue ?? [];
    const maxRev    = Math.max(...dailyData.map((d) => d.revenue), 1);

    const summaryCards = data ? [
        { label: "Revenue", value: convertAndFormat(data.summary.total_revenue, currency, locale), icon: DollarSign, color: "from-green-500 to-emerald-500" },
        { label: "Orders", value: data.summary.total_orders.toLocaleString(), icon: ShoppingCart, color: "from-brand-500 to-indigo-500" },
        { label: "Avg. Order Value", value: convertAndFormat(data.summary.avg_order_value, currency, locale), icon: TrendingUp, color: "from-blue-500 to-cyan-500" },
    ] : [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl lg:text-3xl font-bold"
                >Analytics</motion.h1>
                <div className="flex gap-1 rounded-xl border border-border p-1 bg-muted/30">
                    {(["7d", "30d", "90d", "12m"] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                period === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl border border-border bg-card animate-pulse" />
                    ))}
                </div>
            ) : isError ? (
                <div className="text-sm text-destructive p-6 rounded-2xl border border-destructive/30 bg-destructive/5">Failed to load analytics.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {summaryCards.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className="rounded-2xl border border-border bg-card p-6 hover:shadow-sm transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg`}>
                                        <s.icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-2xl font-bold font-display">{s.value}</p>
                                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-2xl border border-border bg-card p-6"
                    >
                        <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-foreground" /> Revenue Trend
                        </h2>
                        {dailyData.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-12">No revenue data for this period yet.</p>
                        ) : (
                            <div className="h-48 flex items-end gap-1.5">
                                {dailyData.map((d, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex-1 rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 hover:from-brand-600 hover:to-brand-500 transition-all cursor-pointer"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(d.revenue / maxRev) * 100}%` }}
                                        transition={{ delay: i * 0.03, duration: 0.5, ease: "easeOut" }}
                                        title={`${d.date}: ${convertAndFormat(d.revenue, currency, locale)}`}
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    {data!.top_products.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl border border-border bg-card overflow-hidden"
                        >
                            <div className="p-6 border-b border-border font-display font-semibold text-lg">Top Products</div>
                            <div className="divide-y divide-border">
                                {data!.top_products.map((p, i) => (
                                    <motion.div
                                        key={p.product_id}
                                        initial={{ opacity: 0, x: -8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm">{p.product?.name ?? `Product #${p.product_id}`}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{p.units_sold} units sold</p>
                                        </div>
                                        <p className="font-bold text-sm">{convertAndFormat(p.revenue, currency, locale)}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}
        </div>
    );
};

export default SellerAnalytics;
