import { useState } from "react";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useAdminRefunds, useApproveRefundAdmin, useRejectRefundAdmin, AdminRefund } from "@/hooks/useAdminDashboard";
import { convertAndFormat } from "@/utils/currency";
import { useRegionStore } from "@/store/useRegionStore";

const AdminRefunds = () => {
    const [statusFilter, setStatusFilter] = useState("pending");
    const { data: response, isLoading } = useAdminRefunds({ status: statusFilter });
    const approve = useApproveRefundAdmin();
    const reject = useRejectRefundAdmin();
    const { currency, locale } = useRegionStore();
    
    const refunds = response?.data?.data || [];

    const handleReject = (id: number) => {
        const reason = window.prompt("Enter reason for rejection:");
        if (reason) {
            reject.mutate({ id, reason });
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Refund Queue</h1>
            
            <div className="flex gap-4 mb-6">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-4 pr-10 py-2 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                        <tr>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">ID</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Order</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">User</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Amount</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Reason</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Status</th>
                            <th className="text-right px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">Loading refund requests...</td></tr>
                        ) : refunds.map((r: AdminRefund) => (
                            <tr key={r.id} className="border-t border-border hover:bg-muted/20">
                                <td className="px-6 py-4 font-mono font-semibold">REF-{r.id}</td>
                                <td className="px-6 py-4 font-mono">{r.order?.order_number || 'N/A'}</td>
                                <td className="px-6 py-4 text-muted-foreground">{r.order?.user?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 font-medium">{convertAndFormat(r.amount, currency, locale)}</td>
                                <td className="px-6 py-4 max-w-xs truncate" title={r.reason}>{r.reason || 'No reason provided'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${r.status === 'approved' ? 'bg-green-500/10 text-green-600' : r.status === 'rejected' ? 'bg-red-500/10 text-red-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                                        {r.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => approve.mutate(r.id)} disabled={approve.isPending || r.status !== 'pending'} className="text-green-500 hover:bg-green-500/10 p-2 rounded-lg mr-2 disabled:opacity-50 transition-colors" title="Approve">
                                        <CheckCircle className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleReject(r.id)} disabled={reject.isPending || r.status !== 'pending'} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg disabled:opacity-50 transition-colors" title="Reject">
                                        <XCircle className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && refunds.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">No refund requests found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminRefunds;
