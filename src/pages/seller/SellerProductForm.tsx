import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSellerProducts, useCreateProduct, useUpdateProduct } from "@/hooks/useSellerDashboard";
import { ArrowLeft, Save, Package, DollarSign, Tag, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface FormData {
    name       : string;
    description: string;
    price      : string;
    category_id: string;
    status     : "draft" | "published";
    stock      : string;
}

const EMPTY: FormData = {
    name       : "",
    description: "",
    price      : "",
    category_id: "",
    status     : "draft",
    stock      : "0",
};

const SellerProductForm = () => {
    const navigate         = useNavigate();
    const { id }           = useParams<{ id: string }>();
    const isEdit           = Boolean(id);

    const [form, setForm]  = useState<FormData>(EMPTY);
    const [errors, setErrors] = useState<Partial<FormData>>({});

    const createProduct    = useCreateProduct();
    const updateProduct    = useUpdateProduct();

    // Load existing product if editing
    const { data: productsData } = useSellerProducts();
    useEffect(() => {
        if (!isEdit || !productsData) return;
        const products = (productsData as { data: { id: number; name: string; description?: string; price: number; category_id: number; status: "draft" | "published"; }[] }).data;
        const existing = products.find((p) => p.id === parseInt(id!));
        if (existing) {
            setForm({
                name       : existing.name,
                description: existing.description ?? "",
                price      : String(existing.price),
                category_id: String(existing.category_id),
                status     : existing.status,
                stock      : "0",
            });
        }
    }, [isEdit, id, productsData]);

    // ── Validation ─────────────────────────────────────────
    const validate = (): boolean => {
        const e: Partial<FormData> = {};
        if (!form.name.trim())             e.name        = "Product name is required.";
        if (!form.description.trim())      e.description = "Description is required.";
        if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0)
                                           e.price       = "Enter a valid price greater than 0.";
        if (!form.category_id)             e.category_id = "Please select a category.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const payload = {
            name       : form.name,
            description: form.description,
            price      : parseFloat(form.price),
            category_id: parseInt(form.category_id),
            status     : form.status,
            stock      : parseInt(form.stock) || 0,
        };

        if (isEdit) {
            await updateProduct.mutateAsync({ id: parseInt(id!), ...payload });
            navigate("/seller/products");
        } else {
            await createProduct.mutateAsync(payload);
            navigate("/seller/products");
        }
    };

    const isPending = createProduct.isPending || updateProduct.isPending;

    const inputClass = "w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500/50 transition-all";

    // ── Field helper ───────────────────────────────────────
    const field = (
        key: keyof FormData,
        label: string,
        type: "text" | "number" | "textarea" | "select" = "text",
        options?: { value: string; label: string }[]
    ) => (
        <div>
            <label htmlFor={key} className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">{label}</label>
            {type === "textarea" ? (
                <textarea
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    rows={5}
                    className={`${inputClass} resize-none`}
                    placeholder={label}
                />
            ) : type === "select" ? (
                <select
                    id={key}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    className={inputClass}
                >
                    <option value="">Select {label}</option>
                    {options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            ) : (
                <input
                    id={key}
                    type={type}
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={label}
                    className={inputClass}
                />
            )}
            {errors[key] && <p className="text-xs text-destructive mt-1.5 font-medium">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="p-6 lg:p-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <motion.button
                    onClick={() => navigate("/seller/products")}
                    className="p-2.5 rounded-xl hover:bg-muted/50 transition-colors border border-border"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <ArrowLeft className="h-4 w-4" />
                </motion.button>
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">{isEdit ? "Edit Product" : "Add New Product"}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isEdit ? "Update your product details" : "List a new product on the marketplace"}
                    </p>
                </motion.div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Info */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-5"
                >
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-foreground" /> Basic Information
                    </h2>
                    {field("name",        "Product Name")}
                    {field("description", "Description", "textarea")}
                </motion.div>

                {/* Pricing & Inventory */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-5"
                >
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-foreground" /> Pricing & Inventory
                    </h2>
                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="price" className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">Price (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">$</span>
                                <input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={form.price}
                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                    placeholder="0.00"
                                    className={`${inputClass} pl-8`}
                                />
                            </div>
                            {errors.price && <p className="text-xs text-destructive mt-1.5 font-medium">{errors.price}</p>}
                        </div>
                        <div>
                            <label htmlFor="stock" className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">Stock Quantity</label>
                            <input
                                id="stock"
                                type="number"
                                min="0"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                                className={inputClass}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Category & Status */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-2xl border border-border bg-card p-6 lg:p-8 space-y-5"
                >
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                        <Tag className="h-5 w-5 text-foreground" /> Category & Visibility
                    </h2>
                    <div className="grid grid-cols-2 gap-5">
                        {field("category_id", "Category", "select", [
                            { value: "1", label: "Electronics" },
                            { value: "2", label: "Fashion & Apparel" },
                            { value: "3", label: "Home & Kitchen" },
                            { value: "4", label: "Books" },
                            { value: "5", label: "Food & Beverage" },
                            { value: "6", label: "Sports & Fitness" },
                            { value: "7", label: "Health & Beauty" },
                            { value: "8", label: "Toys & Games" },
                        ])}
                        <div>
                            <label htmlFor="status" className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">Listing Status</label>
                            <select
                                id="status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })}
                                className={inputClass}
                            >
                                <option value="draft">Draft — not visible to buyers</option>
                                <option value="published">Published — live on marketplace</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                    <button
                        type="button"
                        onClick={() => navigate("/seller/products")}
                        className="rounded-xl border-2 border-border px-6 py-3 text-sm font-medium hover:bg-muted/50 transition-all"
                    >
                        Cancel
                    </button>
                    <motion.button
                        type="submit"
                        disabled={isPending}
                        className="rounded-xl bg-foreground px-8 py-3 text-sm font-semibold text-white hover:shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        whileHover={{ scale: isPending ? 1 : 1.02 }}
                        whileTap={{ scale: isPending ? 1 : 0.98 }}
                    >
                        {isPending && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        )}
                        <Save className="h-4 w-4" />
                        {isPending ? "Saving…" : (isEdit ? "Update Product" : "Create Product")}
                    </motion.button>
                </div>
            </form>
        </div>
    );
};

export default SellerProductForm;
