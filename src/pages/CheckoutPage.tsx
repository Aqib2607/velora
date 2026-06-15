import { useState, useEffect } from "react";
import { useCartQuery, useClearCart } from "@/hooks/useCartQuery";
import { useRegionStore } from "@/store/useRegionStore";
import { useAuthStore } from "@/store/useAuthStore";
import { convertAndFormat } from "@/utils/currency";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { usePlaceOrder } from "@/hooks/useCheckout";
import { toast } from "sonner";
import { ShoppingBag, CreditCard, Lock, Shield, Truck, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK || "pk_test_TYooMQauvdEDq54NiTphI7jx");

// ── Types ──────────────────────────────────────────────────
interface AddressFields {
    full_name : string;
    address_1 : string;
    city      : string;
    zip       : string;
    country   : string;
}

const EMPTY_ADDRESS: AddressFields = {
    full_name : "",
    address_1 : "",
    city      : "",
    zip       : "",
    country   : "US",
};

// ── Stripe Payment Form ────────────────────────────────────
const StripePaymentForm = ({ clientSecret, orderNumber, total, onCancel }: { clientSecret: string, orderNumber: string, total: number, onCancel: () => void }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const { currency, locale } = useRegionStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout?payment_intent_client_secret=${clientSecret}&order=${orderNumber}`,
            },
        });

        if (error) {
            toast.error(error.message || "Payment failed");
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            <div className="flex gap-4">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isProcessing}
                    className="w-1/3 rounded-xl border border-border px-6 py-4 font-bold hover:bg-muted transition-all duration-300 disabled:opacity-60"
                >
                    Back
                </button>
                <motion.button
                    type="submit"
                    disabled={isProcessing || !stripe || !elements}
                    className="w-2/3 rounded-xl bg-foreground px-6 py-4 font-bold text-background shadow-sm hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 relative overflow-hidden"
                >
                    {isProcessing ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                    ) : (
                        <>
                            <Lock className="h-4 w-4" />
                            Pay {convertAndFormat(total, currency, locale)}
                        </>
                    )}
                </motion.button>
            </div>
        </form>
    );
};

const CheckoutPage = () => {
    const { data: cart } = useCartQuery();
    const { mutate: clearCart } = useClearCart();
    const items = cart?.items || [];
    const totalInUSD = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const { currency, locale, taxRate }   = useRegionStore();
    const { isAuthenticated }             = useAuthStore();
    const { t }                           = useTranslation();
    const navigate                        = useNavigate();
    const placeOrder                      = usePlaceOrder();

    const [address,      setAddress]      = useState<AddressFields>(EMPTY_ADDRESS);
    const [clientSecret,  setClientSecret] = useState<string | null>(null);
    const [placed,        setPlaced]       = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState<string | null>(null);

    // Totals
    const shipping    = totalInUSD > 50 ? 0 : 5.99;
    const tax         = totalInUSD * taxRate;
    const grandTotal  = totalInUSD + shipping + tax;

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');
        const orderNum = searchParams.get('order');

        if (paymentIntentClientSecret && orderNum) {
            setPlaced(true);
            setConfirmedOrder(orderNum);
            clearCart();
            window.history.replaceState({}, '', '/checkout');
        }
    }, [clearCart]);

    // ── Guard: empty cart ──────────────────────────────────
    if (items.length === 0 && !placed && !clientSecret) {
        return (
            <div className="container-premium py-20 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-3">Your cart is empty</h1>
                    <p className="text-muted-foreground mb-8">Add items before checking out.</p>
                    <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5">
                        Continue Shopping
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Guard: not logged in ───────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="container-premium py-20 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                    <div className="h-24 w-24 mx-auto mb-6 rounded-3xl bg-muted/50 flex items-center justify-center">
                        <Lock className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h1 className="font-display text-2xl font-bold mb-3">Sign in to checkout</h1>
                    <p className="text-muted-foreground mb-8">You need an account to place an order.</p>
                    <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-4 font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5">
                        Sign In
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── Success screen ─────────────────────────────────────
    if (placed && confirmedOrder) {
        return (
            <div className="container-premium py-20 text-center">
                <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="max-w-md mx-auto">
                    <motion.div className="h-24 w-24 mx-auto mb-8 rounded-full bg-foreground flex items-center justify-center shadow-sm" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Check className="h-12 w-12 text-background" />
                    </motion.div>
                    <h1 className="font-display text-3xl font-bold mb-3">{t('checkout.order_placed')}</h1>
                    <p className="text-muted-foreground mb-2">{t('checkout.thank_you')}</p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 text-sm mb-8">
                        Order <span className="font-mono font-bold text-foreground">{confirmedOrder}</span>
                    </div>
                    <div className="flex gap-3 justify-center">
                        <Link to="/orders" className="rounded-xl bg-foreground px-8 py-3.5 font-semibold text-background shadow-sm transition-all hover:-translate-y-0.5">
                            View Orders
                        </Link>
                        <Link to="/" className="rounded-xl border-2 border-border px-8 py-3.5 font-semibold hover:bg-muted/50 transition-all">
                            Continue Shopping
                        </Link>
                    </div>
                </motion.div>
            </div>
        );
    }

    // ── Address field helper ───────────────────────────────
    const field = (key: keyof AddressFields, placeholder: string, type = "text") => (
        <div>
            <label htmlFor={key} className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">
                {placeholder}
            </label>
            <input
                id={key}
                type={type}
                placeholder={placeholder}
                value={address[key]}
                onChange={(e) => setAddress({ ...address, [key]: e.target.value })}
                required
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
            />
        </div>
    );

    // ── Handle Continue to Payment ─────────────────────────
    const handleContinueToPayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!address.full_name || !address.address_1 || !address.city || !address.zip) {
            toast.error("Please fill in all shipping fields.");
            return;
        }

        try {
            const result = await placeOrder.mutateAsync({
                shipping     : address,
                currency_code: currency,
                exchange_rate: 1,
            });

            setClientSecret(result.client_secret);
            setConfirmedOrder(result.order.order_number);
        } catch {
            // Error handled by useCheckout
        }
    };

    const steps = [
        { label: "Shipping", icon: Truck },
        { label: "Payment", icon: CreditCard },
        { label: "Review", icon: Check },
    ];

    const currentStep = clientSecret ? 1 : 0;

    return (
        <div className="container-premium py-8 lg:py-12 max-w-5xl">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-0 mb-12">
                {steps.map((step, i) => (
                    <div key={step.label} className="flex items-center">
                        <div className="flex items-center gap-2">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all ${
                                i <= currentStep ? 'bg-foreground text-background shadow-sm' : 'bg-muted text-muted-foreground'
                            }`}>
                                <step.icon className="h-4 w-4" />
                            </div>
                            <span className="hidden sm:block text-sm font-semibold">{step.label}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className="w-12 sm:w-20 h-px bg-border mx-3" />
                        )}
                    </div>
                ))}
            </div>

            <motion.h1
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-title font-bold mb-8"
            >
                {t('checkout.title')}
            </motion.h1>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
                {/* ── Left: Form ─────── */}
                <div className="lg:col-span-3 space-y-8">
                    {!clientSecret ? (
                        <form onSubmit={handleContinueToPayment}>
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-2xl border border-border bg-card p-6 lg:p-8 mb-6"
                            >
                                <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                                    <Truck className="h-5 w-5 text-foreground" />
                                    {t('checkout.shipping_address')}
                                </h2>
                                <div className="space-y-4">
                                    {field("full_name", t('checkout.full_name'))}
                                    {field("address_1", t('checkout.address_line_1'))}
                                    <div className="grid grid-cols-2 gap-4">
                                        {field("city", t('checkout.city'))}
                                        {field("zip",  t('checkout.zip_code'))}
                                    </div>
                                    <div>
                                        <label htmlFor="country" className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">Country</label>
                                        <select
                                            id="country"
                                            value={address.country}
                                            onChange={(e) => setAddress({ ...address, country: e.target.value })}
                                            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/10 focus:border-foreground/50 transition-all"
                                        >
                                            <option value="US">United States</option>
                                            <option value="GB">United Kingdom</option>
                                            <option value="CA">Canada</option>
                                            <option value="AU">Australia</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.button
                                type="submit"
                                disabled={placeOrder.isPending}
                                className="w-full rounded-xl bg-foreground px-6 py-4 font-bold text-background shadow-sm hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2.5"
                            >
                                {placeOrder.isPending ? "Processing..." : "Continue to Payment"}
                            </motion.button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-border bg-card p-6 lg:p-8"
                        >
                            <h2 className="font-display font-semibold text-lg mb-6 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-foreground" />
                                Payment details
                            </h2>
                            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                                <StripePaymentForm 
                                    clientSecret={clientSecret} 
                                    orderNumber={confirmedOrder!} 
                                    total={grandTotal}
                                    onCancel={() => setClientSecret(null)}
                                />
                            </Elements>
                        </motion.div>
                    )}
                </div>

                {/* ── Right: order summary ─────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-2"
                >
                    <div className="rounded-2xl border border-border bg-card p-6 lg:p-8 h-fit sticky top-32 shadow-sm">
                        <h2 className="font-display font-bold text-xl mb-6">{t('cart.order_summary')}</h2>

                        <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 text-sm">
                                    <img
                                        src={item.sku.product.thumbnail || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
                                        alt={item.sku.product.name}
                                        className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                                    />
                                    <span className="flex-1 truncate font-medium">
                                        {item.sku.product.name} × {item.quantity}
                                    </span>
                                    <span className="font-semibold whitespace-nowrap">
                                        {convertAndFormat(item.unit_price * item.quantity, currency, locale)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Gift Card */}
                        <div className="border-t border-border pt-5 pb-5">
                            <label className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wide">Gift Card</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Enter gift card code" 
                                    className="flex-1 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:border-foreground"
                                />
                                <button className="px-4 py-2 bg-muted hover:bg-foreground hover:text-background font-semibold text-sm rounded-xl transition-colors">
                                    Apply
                                </button>
                            </div>
                        </div>

                        {/* Breakdown */}
                        <div className="border-t border-border pt-5 space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-semibold">{convertAndFormat(totalInUSD, currency, locale)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-semibold text-green-600">{shipping === 0 ? "FREE" : convertAndFormat(shipping, currency, locale)}</span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-semibold">{convertAndFormat(tax, currency, locale)}</span>
                                </div>
                            )}
                            <div className="divider-gradient my-2" />
                            <div className="flex justify-between font-bold text-xl pt-1">
                                <span>{t('cart.total')}</span>
                                <span className="text-foreground">{convertAndFormat(grandTotal, currency, locale)}</span>
                            </div>
                        </div>

                        {/* Trust */}
                        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure Checkout</span>
                            <span className="flex items-center gap-1"><Lock className="h-3 w-3" /> Stripe Powered</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CheckoutPage;
