import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { useRegionStore } from "@/store/useRegionStore";
import { convertAndFormat } from "@/utils/currency";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, RotateCcw } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

// ── Types ──────────────────────────────────────────────────
interface OrderItem {
    id        : number;
    product_id: number;
    quantity  : number;
    subtotal  : number;
}

interface OrderDetail {
    id          : number;
    order_number: string;
    status      : string;
    total       : number;
    created_at  : string;
    updated_at  : string;
    items       : OrderItem[];
    payment     : { stripe_payment_intent_id: string; status: string; amount: number } | null;
    refunds     : { id: number; amount: number; status: string; created_at: string }[];
}

// ── Status timeline steps ──────────────────────────────────
const ORDER_STEPS = [
    { key: "pending",    label: "Order Placed",      icon: Clock },
    { key: "processing", label: "Processing",         icon: Package },
    { key: "paid",       label: "Payment Confirmed",  icon: CheckCircle },
    { key: "shipped",    label: "Shipped",            icon: Truck },
    { key: "delivered",  label: "Delivered",          icon: CheckCircle },
];

const TERMINAL_NEGATIVE = ["cancelled", "refunded"];

// ── Status badge ───────────────────────────────────────────
const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
        paid      : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        delivered : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        processing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        pending   : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        shipped   : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
        cancelled : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        refunded  : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    };
    const cls = colors[status] ?? "bg-muted text-muted-foreground";
    return <span className={`text-sm px-3 py-1 rounded-full font-medium capitalize ${cls}`}>{status}</span>;
};

const OrderDetailPage = () => {
    const { id }              = useParams<{ id: string }>();
    const navigate            = useNavigate();
    const { currency, locale } = useRegionStore();

    const { data: order, isLoading, isError } = useQuery<OrderDetail>({
        queryKey: ["order", id],
        queryFn : () => apiFetch("GET", `/v1/orders/${id}`),
        enabled : Boolean(id),
    });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-muted rounded w-1/3" />
                    <div className="h-32 bg-muted rounded-xl" />
                    <div className="h-48 bg-muted rounded-xl" />
                </div>
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
                <h1 className="text-xl font-bold mb-2">Order Not Found</h1>
                <p className="text-muted-foreground mb-6">This order doesn't exist or you don't have access to it.</p>
                <Link to="/orders" className="text-primary hover:underline">← Back to Orders</Link>
            </div>
        );
    }

    const stepIndex = ORDER_STEPS.findIndex((s) => s.key === order.status);
    const isNegative = TERMINAL_NEGATIVE.includes(order.status);

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">

            {/* Back + header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Placed {format(new Date(order.created_at), "PPP")} · {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                </div>
                <div className="ml-auto">{statusBadge(order.status)}</div>
            </div>

            {/* Timeline */}
            {!isNegative && (
                <div className="rounded-xl border border-border bg-card p-6 mb-6">
                    <h2 className="font-semibold mb-5">Order Progress</h2>
                    <div className="flex items-center gap-0">
                        {ORDER_STEPS.map((step, i) => {
                            const done    = stepIndex >= i;
                            const current = stepIndex === i;
                            const Icon    = step.icon;
                            return (
                                <div key={step.key} className="flex-1 flex flex-col items-center">
                                    <div className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition-colors ${
                                        done ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
                                    } ${current ? "ring-2 ring-primary/30" : ""}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <p className={`text-xs mt-2 text-center max-w-[70px] ${done ? "font-medium" : "text-muted-foreground"}`}>
                                        {step.label}
                                    </p>
                                    {i < ORDER_STEPS.length - 1 && (
                                        <div className={`absolute translate-x-[50%] h-0.5 w-full mt-[-18px] ${done ? "bg-primary" : "bg-border"}`}
                                             style={{ left: '50%', top: '1.125rem', position: 'relative', translate: '50% -18px' }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isNegative && (
                <div className={`rounded-xl border p-5 mb-6 flex items-center gap-3 ${
                    order.status === "cancelled" ? "border-red-300 bg-red-50 dark:bg-red-900/20" : "border-purple-300 bg-purple-50 dark:bg-purple-900/20"
                }`}>
                    {order.status === "cancelled" ? (
                        <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                        <RotateCcw className="h-5 w-5 text-purple-600" />
                    )}
                    <div>
                        <p className="font-medium text-sm capitalize">{order.status}</p>
                        <p className="text-xs text-muted-foreground">
                            Updated {formatDistanceToNow(new Date(order.updated_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            )}

            {/* Order Items */}
            <div className="rounded-xl border border-border bg-card overflow-hidden mb-6">
                <div className="p-5 border-b border-border font-semibold">Order Items</div>
                <div className="divide-y divide-border">
                    {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                            <div className="h-14 w-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Product #{item.product_id}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">{convertAndFormat(item.subtotal, currency, locale)}</p>
                        </div>
                    ))}
                </div>
                <div className="p-5 border-t border-border flex justify-between font-bold">
                    <span>Total</span>
                    <span>{convertAndFormat(order.total, currency, locale)}</span>
                </div>
            </div>

            {/* Payment info */}
            {order.payment && (
                <div className="rounded-xl border border-border bg-card p-5 mb-6">
                    <h2 className="font-semibold mb-3">Payment</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Payment Intent</span>
                            <code className="text-xs font-mono">{order.payment.stripe_payment_intent_id}</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="capitalize font-medium">{order.payment.status}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Refunds */}
            {order.refunds.length > 0 && (
                <div className="rounded-xl border border-border bg-card p-5">
                    <h2 className="font-semibold mb-3">Refunds</h2>
                    {order.refunds.map((r) => (
                        <div key={r.id} className="flex items-center justify-between py-2 border-t border-border first:border-0 text-sm">
                            <span className="text-muted-foreground">
                                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                            </span>
                            <span className="capitalize text-purple-600">{r.status}</span>
                            <span className="font-medium">{convertAndFormat(r.amount, currency, locale)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex gap-3">
                <Link to="/orders" className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-muted transition-colors">
                    ← All Orders
                </Link>
                {order.status === "paid" && (
                    <button className="rounded-lg border border-border px-5 py-2.5 text-sm hover:bg-muted transition-colors text-muted-foreground">
                        Request Refund
                    </button>
                )}
            </div>
        </div>
    );
};

export default OrderDetailPage;
