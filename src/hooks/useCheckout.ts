import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';

// ──────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────

interface ShippingAddress {
    full_name : string;
    address_1 : string;
    city      : string;
    zip       : string;
    country   : string;
}

interface PlaceOrderPayload {
    shipping       : ShippingAddress;
    currency_code  : string;
    exchange_rate  : number;
    region_code   ?: string;
}

interface PlaceOrderResponse {
    order         : { id: number; order_number: string; total: number; status: string };
    client_secret : string;
    payment_intent: string;
}

// ──────────────────────────────────────────────────────────
// Hook
// ──────────────────────────────────────────────────────────

/**
 * Places an order via the backend OrderSagaOrchestrator.
 * Returns the Stripe client_secret to confirm payment on the frontend.
 *
 * Flow:
 *  1. POST /api/v1/orders → backend creates order + Stripe PaymentIntent
 *  2. Frontend receives client_secret
 *  3. Frontend confirms payment with Stripe.js (handled in CheckoutPage)
 *  4. Stripe webhook → backend confirms inventory + posts ledger entries
 */
export function usePlaceOrder() {
    const { clearCart } = useCartStore();
    const navigate      = useNavigate();

    return useMutation({
        mutationFn: (payload: PlaceOrderPayload) =>
            apiFetch<PlaceOrderResponse>('POST', '/v1/orders', payload),

        onError: (error: { response?: { data?: { message?: string; error_code?: string } } }) => {
            const data = error?.response?.data;
            const msg  = data?.message ?? 'Failed to place order. Please try again.';
            if (data?.error_code === 'INVENTORY_INSUFFICIENT') {
                toast.error('Some items are out of stock. Please update your cart.');
            } else {
                toast.error(msg);
            }
        },
    });
}

/**
 * Called after a successful Stripe payment confirmation.
 * Clears cart and redirects to order confirmation.
 */
export function useOrderSuccess() {
    const { clearCart } = useCartStore();
    const navigate      = useNavigate();

    return (orderNumber: string) => {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders?confirmed=${orderNumber}`);
    };
}
