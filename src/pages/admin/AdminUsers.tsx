import { useState } from "react";
import { Search, UserX, Ban } from "lucide-react";
import { useAdminUsers, useSuspendUser, useBanUser, AdminUser } from "@/hooks/useAdminDashboard";

const AdminUsers = () => {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = useAdminUsers({ search });
    const suspend = useSuspendUser();
    const ban = useBanUser();
    
    const users = response?.data?.data || [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">User Management</h1>
            
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search users by email or name..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-background border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-muted/30">
                        <tr>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">ID</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Name</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Email</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Status</th>
                            <th className="text-right px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">Loading users...</td></tr>
                        ) : users.map((u: AdminUser) => (
                            <tr key={u.id} className="border-t border-border hover:bg-muted/20">
                                <td className="px-6 py-4 font-mono font-semibold">USR-{u.id}</td>
                                <td className="px-6 py-4 font-medium">{u.name}</td>
                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => suspend.mutate(u.id)} disabled={suspend.isPending || u.status === 'suspended' || u.status === 'banned'} className="text-orange-500 hover:bg-orange-500/10 p-2 rounded-lg mr-2 disabled:opacity-50 transition-colors" title="Suspend">
                                        <UserX className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => ban.mutate(u.id)} disabled={ban.isPending || u.status === 'banned'} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg disabled:opacity-50 transition-colors" title="Ban">
                                        <Ban className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
