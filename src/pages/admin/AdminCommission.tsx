import { useState } from "react";
import { Percent, Plus } from "lucide-react";
import { useAdminCommissions, useCreateCommission, type CommissionRule } from "@/hooks/useAdminDashboard";
import { motion } from "framer-motion";

const SkeletonRow = ({ cols }: { cols: number }) => (
    <tr className="border-t border-border animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-3/4" /></td>
        ))}
    </tr>
);

export const AdminCommission = () => {
    const { data, isLoading } = useAdminCommissions();
    const commissions: CommissionRule[] = (data as { data: { data: CommissionRule[] } } | undefined)?.data?.data ?? [];
    
    const createRule = useCreateCommission();

    const handleCreate = () => {
        const name = prompt("Enter rule name (e.g. Standard rate):");
        if (!name) return;
        createRule.mutate({ name, type: 'percentage', rate: 10.0, is_default: true, is_active: true });
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
                >
                    <Percent className="h-7 w-7 text-foreground" /> Commission Rules
                </motion.h1>
                <motion.button
                    onClick={handleCreate}
                    disabled={createRule.isPending}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-sm transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="h-4 w-4" /> Add Rule
                </motion.button>
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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Rule Name</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Category</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Type</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Rate</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                                : commissions.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-medium">
                                            No commission rules found.
                                        </td>
                                    </tr>
                                )
                                : commissions.map((r) => (
                                    <tr key={r.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-semibold">
                                            {r.name} {r.is_default && <span className="ml-2 text-[10px] bg-foreground/10 text-foreground px-2 py-0.5 rounded-full font-bold ring-1 ring-foreground/20">DEFAULT</span>}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{r.category?.name || "Global"}</td>
                                        <td className="px-6 py-4 capitalize">{r.type}</td>
                                        <td className="px-6 py-4 font-bold">{r.rate}{r.type === 'percentage' ? '%' : ''}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ring-1 ${
                                                r.is_active
                                                    ? 'bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20'
                                                    : 'bg-muted text-muted-foreground ring-border'
                                            }`}>
                                                {r.is_active ? 'Active' : 'Inactive'}
                                            </span>
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
export default AdminCommission;
