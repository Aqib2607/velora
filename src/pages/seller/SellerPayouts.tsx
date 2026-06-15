import { Archive, DollarSign, Clock } from "lucide-react";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useSellerPayouts, useOnboardStripe, type SellerPayout } from "@/hooks/useSellerDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        paid   : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
        failed : "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
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

export const SellerPayouts = () => {
    const { currency, locale }         = useRegionStore();
    const { data, isLoading, isError } = useSellerPayouts();
    const onboardStripe                = useOnboardStripe();

    const payouts: SellerPayout[] = data?.payouts?.data ?? [];
    const summary = data?.summary;
    const isStripeConnected = !!data?.stripe_account_id;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl lg:text-3xl font-bold"
                >Payouts</motion.h1>
                <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-all">
                    <Archive className="h-4 w-4" /> Export CSV
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="h-28 rounded-2xl border border-border bg-card animate-pulse" />
                    ))}
                </div>
            ) : !isStripeConnected ? (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-border bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
                >
                    <div>
                        <h2 className="font-display font-bold text-xl mb-2">Connect Stripe to receive payouts</h2>
                        <p className="text-muted-foreground text-sm max-w-md">Velora uses Stripe to get you paid quickly and securely. You need to set up a Stripe Express account to start receiving your earnings.</p>
                    </div>
                    <button
                        onClick={() => onboardStripe.mutate()}
                        disabled={onboardStripe.isPending}
                        className="whitespace-nowrap rounded-xl bg-indigo-600 px-8 py-3.5 font-bold text-white shadow-sm hover:bg-indigo-700 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {onboardStripe.isPending ? "Generating link..." : "Set up Stripe Express"}
                    </button>
                </motion.div>
            ) : summary ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-border bg-card p-6 hover:shadow-sm transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                <DollarSign className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold font-display text-green-600">{convertAndFormat(summary.total_paid, currency, locale)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total Paid</p>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.08 }}
                        className="rounded-2xl border border-border bg-card p-6 hover:shadow-sm transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                                <Clock className="h-5 w-5 text-white" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold font-display">{convertAndFormat(summary.total_pending, currency, locale)}</p>
                        <p className="text-sm text-muted-foreground mt-1">Pending</p>
                    </motion.div>
                </div>
            ) : null}

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card overflow-hidden"
            >
                <div className="p-6 border-b border-border font-display font-semibold text-lg">Payout History</div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Amount</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
                                : isError
                                ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-destructive text-sm">Failed to load payouts.</td>
                                    </tr>
                                )
                                : payouts.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-16 text-center text-muted-foreground font-medium">No payouts yet.</td>
                                    </tr>
                                )
                                : payouts.map((p) => (
                                    <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-semibold">PAY-{p.id}</td>
                                        <td className="px-6 py-4 font-semibold">{convertAndFormat(p.amount, currency, locale)}</td>
                                        <td className="px-6 py-4">{statusBadge(p.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
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

export default SellerPayouts;
