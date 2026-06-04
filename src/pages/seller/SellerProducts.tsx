import { useState } from "react";
import { Package, Plus, Search, Upload, Edit2, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { useSellerProducts, useDeleteProduct, type SellerProduct } from "@/hooks/useSellerDashboard";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const statusBadge = (status: string) => {
    const cls: Record<string, string> = {
        published : "bg-green-500/10 text-green-600 dark:text-green-400 ring-green-500/20",
        draft     : "bg-muted text-muted-foreground ring-border",
        archived  : "bg-red-500/10 text-red-600 dark:text-red-400 ring-red-500/20",
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

export const SellerProducts = () => {
    const [search, setSearch]     = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage]         = useState(1);
    const { currency, locale }    = useRegionStore();
    const navigate                = useNavigate();
    const deleteProduct           = useDeleteProduct();

    const { data, isLoading, isError } = useSellerProducts({
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        page,
    });

    const products: SellerProduct[] = (data as { data: SellerProduct[] } | undefined)?.data ?? [];
    const meta = (data as { meta?: { total: number; per_page: number; last_page: number } } | undefined)?.meta;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <motion.h1
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-2xl lg:text-3xl font-bold"
                >Products</motion.h1>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted/50 transition-all">
                        <Upload className="h-4 w-4" /> Bulk Upload
                    </button>
                    <Link
                        to="/seller/products/new"
                        className="flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white hover:shadow-sm transition-all"
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </Link>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Search products..."
                        className="w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all"
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                </select>
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
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Price</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Created</th>
                                <th className="text-left px-6 py-3.5 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading
                                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={5} />)
                                : isError
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-destructive text-sm">
                                            Failed to load products.
                                        </td>
                                    </tr>
                                )
                                : products.length === 0
                                ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
                                            <p className="text-muted-foreground font-medium">No products found.</p>
                                            <Link to="/seller/products/new" className="text-foreground text-sm hover:underline mt-1 inline-block font-semibold">
                                                Add your first product →
                                            </Link>
                                        </td>
                                    </tr>
                                )
                                : products.map((p) => (
                                    <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-semibold">{p.name}</td>
                                        <td className="px-6 py-4 font-semibold">{convertAndFormat(p.price, currency, locale)}</td>
                                        <td className="px-6 py-4">{statusBadge(p.status)}</td>
                                        <td className="px-6 py-4 text-muted-foreground text-xs font-medium">
                                            {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1.5">
                                                <button
                                                    onClick={() => navigate(`/seller/products/${p.id}/edit`)}
                                                    className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteProduct.mutate(p.id)}
                                                    disabled={deleteProduct.isPending}
                                                    className="p-2 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                                                    title="Archive"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>

                {meta && meta.last_page > 1 && (
                    <div className="p-5 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                        <span className="font-medium">Page {page} of {meta.last_page} ({meta.total} total)</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 rounded-xl border border-border hover:bg-muted/50 disabled:opacity-40 font-medium transition-all"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="px-4 py-2 rounded-xl border border-border hover:bg-muted/50 disabled:opacity-40 font-medium transition-all"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SellerProducts;
