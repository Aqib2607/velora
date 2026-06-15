import { useState } from "react";
import { Search, ShieldAlert, Trash2 } from "lucide-react";
import { useAdminProducts, useSuspendProduct, useDeleteProduct, AdminProduct } from "@/hooks/useAdminDashboard";
import { convertAndFormat } from "@/utils/currency";
import { useRegionStore } from "@/store/useRegionStore";

const AdminProducts = () => {
    const [search, setSearch] = useState("");
    const { data: response, isLoading } = useAdminProducts({ search });
    const suspend = useSuspendProduct();
    const del = useDeleteProduct();
    const { currency, locale } = useRegionStore();
    
    const products = response?.data?.data || [];

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Product Moderation</h1>
            
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
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
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Seller</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Price</th>
                            <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Status</th>
                            <th className="text-right px-6 py-3.5 font-semibold text-muted-foreground uppercase text-xs">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading products...</td></tr>
                        ) : products.map((p: AdminProduct) => (
                            <tr key={p.id} className="border-t border-border hover:bg-muted/20">
                                <td className="px-6 py-4 font-mono font-semibold">PRD-{p.id}</td>
                                <td className="px-6 py-4 font-medium">{p.name}</td>
                                <td className="px-6 py-4 text-muted-foreground">{p.seller_profile?.company_name || 'N/A'}</td>
                                <td className="px-6 py-4 font-medium">{convertAndFormat(p.price, currency, locale)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.status === 'published' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => suspend.mutate(p.id)} disabled={suspend.isPending || p.status === 'archived'} className="text-orange-500 hover:bg-orange-500/10 p-2 rounded-lg mr-2 disabled:opacity-50 transition-colors" title="Suspend">
                                        <ShieldAlert className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => del.mutate(p.id)} disabled={del.isPending} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg disabled:opacity-50 transition-colors" title="Delete">
                                        <Trash2 className="h-4 w-4" />
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

export default AdminProducts;
