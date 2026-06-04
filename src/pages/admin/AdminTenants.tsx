import { useState } from "react";
import { Building2, Plus, Activity } from "lucide-react";
import { useAdminTenants, useCreateTenant, useUpdateTenant, type Tenant } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        active   : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        suspended: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
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

export const AdminTenants = () => {
    const { data, isLoading } = useAdminTenants();
    const tenants: Tenant[] = (data as { data: { data: Tenant[] } } | undefined)?.data?.data ?? [];

    const createTenant = useCreateTenant();

    const handleCreate = () => {
        const name = prompt("Enter tenant name:");
        if (!name) return;
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        createTenant.mutate({ name, slug, status: 'active', plan: 'standard' });
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
                >
                    <Building2 className="h-7 w-7 text-foreground" /> Tenant Management
                </motion.h1>
                <motion.button
                    onClick={handleCreate}
                    disabled={createTenant.isPending}
                    className="flex items-center gap-2 bg-foreground text-background px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-sm transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Plus className="h-4 w-4" /> New Tenant
                </motion.button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3"
            >
                <div className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-sm text-muted-foreground">All tenants are fully isolated via the ResolveTenant middleware.</span>
            </motion.div>

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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Tenant Name</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Slug/Domain</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Plan</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                                : tenants.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-medium">
                                            No tenants found.
                                        </td>
                                    </tr>
                                )
                                : tenants.map((t) => (
                                    <tr key={t.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-semibold">{t.name}</td>
                                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{t.domain || t.slug}</td>
                                        <td className="px-6 py-4">
                                            <span className="uppercase text-[11px] font-bold px-2.5 py-1 rounded-lg bg-muted">{t.plan}</span>
                                        </td>
                                        <td className="px-6 py-4">{statusBadge(t.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
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
export default AdminTenants;
