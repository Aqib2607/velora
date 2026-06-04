import { FileText } from "lucide-react";
import { useAuditLogs, type AuditLog } from "@/hooks/useAdminDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const SkeletonRow = ({ cols }: { cols: number }) => (
    <tr className="border-t border-border animate-pulse">
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="px-6 py-4"><div className="h-4 bg-muted rounded-lg w-3/4" /></td>
        ))}
    </tr>
);

export const AdminAuditLogs = () => {
    const { data, isLoading } = useAuditLogs();
    const logs: AuditLog[]    = (data as { data: AuditLog[] } | undefined)?.data ?? [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl lg:text-3xl font-bold flex items-center gap-3"
            >
                <FileText className="h-7 w-7 text-foreground" /> Audit Logs
            </motion.h1>
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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Time</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} cols={3} />)
                                : logs.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-16 text-center text-muted-foreground font-medium">
                                            No audit log entries yet.
                                        </td>
                                    </tr>
                                )
                                : logs.map((log) => (
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
export default AdminAuditLogs;
