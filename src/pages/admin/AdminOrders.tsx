import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useAdminOrders, type AdminOrder } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        paid      : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        processing: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
        refunded  : "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20",
        cancelled : "bg-muted text-muted-foreground ring-border",
    };
    return <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1 capitalize ${cls[status] ?? 'bg-muted text-muted-foreground ring-border'}`}>{status.replace(/_/g, " ")}</span>;
};

const SkeletonRow = ({ cols }: { cols: number }) => (
    <tr className="border-t border-border animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-3/4" /></td>
        ))}
    </tr>
);

export const AdminOrders = () => {
    const [filter, setFilter]  = useState("all");
    const [page, setPage]      = useState(1);
    const { currency, locale } = useRegionStore();

    const { data, isLoading }  = useAdminOrders({
        status: filter === "all" ? undefined : filter,
        page,
    });

    const orders: AdminOrder[] = (data as { data: AdminOrder[] } | undefined)?.data ?? [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
            >
                <ShoppingCart className="h-7 w-7 text-foreground" /> Order Management
            </motion.h1>

            <div className="flex gap-2 flex-wrap">
                {["all", "paid", "processing", "refunded", "cancelled"].map((s) => (
                    <button
                        key={s}
                        onClick={() => { setFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                            filter === s
                                ? "bg-foreground text-background shadow-sm"
                                : "border border-border hover:bg-muted/50"
                        }`}
                    >
                        {s === "all" ? "All Orders" : s.replace(/_/g, " ")}
                    </button>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
            >
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
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                                : orders.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-medium">No orders found.</td>
                                    </tr>
                                )
                                : orders.map((o) => (
                                    <tr key={o.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold">{o.order_number}</td>
                                        <td className="px-6 py-4 font-medium">{o.user?.name ?? "—"}</td>
                                        <td className="px-6 py-4 font-semibold">{convertAndFormat(o.total, currency, locale)}</td>
                                        <td className="px-6 py-4">{statusBadge(o.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(o.created_at), { addSuffix: true })}
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
export default AdminOrders;
