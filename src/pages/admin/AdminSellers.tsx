import { useState } from "react";
import { Users, Eye } from "lucide-react";
import { useAdminUsers, type AdminUser } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        active   : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        pending  : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 ring-yellow-500/20",
        suspended: "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
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

export const AdminSellers = () => {
    const [filter, setFilter]   = useState("all");

    const { data, isLoading }   = useAdminUsers({
        status: filter === "all" ? undefined : filter,
    });

    const users: AdminUser[] = (data as { data: AdminUser[] } | undefined)?.data ?? [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
            >
                <Users className="h-7 w-7 text-foreground" /> Seller Management
            </motion.h1>

            <div className="flex gap-2">
                {["all", "active", "pending", "suspended"].map((s) => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all duration-200 ${
                            filter === s
                                ? "bg-foreground text-background shadow-sm"
                                : "border border-border hover:bg-muted/50"
                        }`}
                    >
                        {s === "all" ? "All Users" : s}
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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">User</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Joined</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                                : users.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground font-medium">No users found.</td>
                                    </tr>
                                )
                                : users.map((u) => (
                                    <tr key={u.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold">{u.name}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{u.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-muted">
                                                {u.roles.map((r) => r.name).join(", ") || "buyer"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{statusBadge(u.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
                                                <Eye className="h-4 w-4" />
                                            </button>
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
export default AdminSellers;
