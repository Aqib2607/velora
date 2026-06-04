import { useState } from "react";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useSellerRefunds, useApproveRefund, useRejectRefund, type SellerRefund } from "@/hooks/useSellerDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        pending  : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
        approved : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        rejected : "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
    };
    return <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1 capitalize ${cls[status] ?? 'bg-muted text-muted-foreground ring-border'}`}>{status}</span>;
};

const SkeletonRow = ({ cols }: { cols: number }) => (
    <tr className="border-t border-border animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-3/4" /></td>
        ))}
    </tr>
);

export const SellerRefunds = () => {
    const [statusFilter, setStatusFilter] = useState("pending");
    const [page, setPage]                 = useState(1);
    const { currency, locale }            = useRegionStore();
    
    const approveRefund = useApproveRefund();
    const rejectRefund  = useRejectRefund();

    const { data, isLoading, isError } = useSellerRefunds({
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
    });

    const refunds: SellerRefund[] = (data as { data: SellerRefund[] } | undefined)?.data ?? [];

    const filters = ["all", "pending", "approved", "rejected"];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
            >
                <AlertTriangle className="h-7 w-7 text-yellow-500" /> Refunds & Returns
            </motion.h1>

            <div className="flex gap-2 flex-wrap">
                {filters.map((s) => (
                    <button
                        key={s}
                        onClick={() => { setStatusFilter(s); setPage(1); }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                            statusFilter === s
                                ? "bg-foreground text-background shadow-sm"
                                : "border border-border hover:bg-muted/50"
                        }`}
                    >
                        {s === "all" ? "All Requests" : s}
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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Order ID</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Reason</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                                : isError
                                ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-destructive text-sm">Failed to load refund requests.</td>
                                    </tr>
                                )
                                : refunds.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground font-medium">No refund requests match this filter.</td>
                                    </tr>
                                )
                                : refunds.map((r) => (
                                    <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold">{r.order_id}</td>
                                        <td className="px-6 py-4">{r.reason}</td>
                                        <td className="px-6 py-4 font-semibold">{convertAndFormat(r.amount, currency, locale)}</td>
                                        <td className="px-6 py-4">{statusBadge(r.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.status === 'pending' && (
                                                <div className="flex gap-1.5">
                                                    <motion.button
                                                        onClick={() => approveRefund.mutate(r.id)}
                                                        disabled={approveRefund.isPending}
                                                        className="p-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-all"
                                                        title="Approve Refund"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => rejectRefund.mutate(r.id)}
                                                        disabled={rejectRefund.isPending}
                                                        className="p-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all"
                                                        title="Reject Refund"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                    </motion.button>
                                                </div>
                                            )}
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

export default SellerRefunds;
