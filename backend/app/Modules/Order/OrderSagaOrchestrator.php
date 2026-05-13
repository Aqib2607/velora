<?php

namespace App\Modules\Order;

use App\Models\Cart;
use App\Models\InventoryReservation;
use App\Models\Order;
use App\Modules\Inventory\InventoryService;
use App\Modules\Payment\PaymentService;
use App\Modules\Ledger\LedgerService;
use App\Modules\Commission\CommissionService;
use App\Events\OrderPaid;
use App\Events\OrderCancelled;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class OrderSagaOrchestrator
{
    public function __construct(
        private readonly InventoryService  $inventory,
        private readonly PaymentService    $payment,
        private readonly LedgerService     $ledger,
        private readonly CommissionService $commission,
    ) {}

    /**
     * Step 1-4: Initiate checkout — validate cart, reserve inventory, create order, create payment intent.
     *
     * @param array $addressData  Must contain 'shipping' and optionally 'billing'
     * @param array $currencyData Optional: ['currency_code' => 'BDT', 'exchange_rate' => 110.50, 'region_code' => 'BD']
     */
    public function initiateCheckout(Cart $cart, array $addressData, int $tenantId, array $currencyData = []): array
    {
        return DB::transaction(function () use ($cart, $addressData, $tenantId, $currencyData) {
            $cart->load('items.sku.inventory');

            if ($cart->items->isEmpty()) {
                throw new RuntimeException('Cart is empty.');
            }

            $currencyCode  = $currencyData['currency_code'] ?? 'USD';
            $exchangeRate  = (float) ($currencyData['exchange_rate'] ?? 1.0);
            $regionCode    = $currencyData['region_code'] ?? null;

            $reservations = [];
            $orderItems   = [];
            $subtotal     = 0;

            foreach ($cart->items as $item) {
                // Step 2: Soft-reserve inventory
                $reservations[] = $this->inventory->reserve(
                    $item->sku,
                    $item->quantity,
                    $cart->user_id,
                    'pending'
                );

                $lineTotal  = $item->unit_price * $item->quantity;
                $subtotal  += $lineTotal;
                $orderItems[] = [
                    'sku_id'            => $item->sku_id,
                    'seller_profile_id' => $item->sku->product->seller_profile_id,
                    'product_name'      => $item->sku->product->name,
                    'sku_code'          => $item->sku->sku_code,
                    'quantity'          => $item->quantity,
                    'unit_price'        => $item->unit_price,
                    'total'             => $lineTotal,
                    'options'           => $item->sku->options,
                ];
            }

            // Step 3: Create pending order with immutable currency snapshot
            $order = Order::create([
                'tenant_id'              => $tenantId,
                'user_id'                => $cart->user_id,
                'order_number'           => 'ORD-' . strtoupper(Str::random(10)),
                'status'                 => 'payment_pending',
                'subtotal'               => $subtotal,
                'tax'                    => 0,
                'shipping'               => 0,
                'discount'               => 0,
                'total'                  => $subtotal,
                'currency_code'          => $currencyCode,
                'exchange_rate_snapshot' => $exchangeRate,
                'region_code'            => $regionCode,
                'shipping_address'       => $addressData['shipping'] ?? null,
                'billing_address'        => $addressData['billing'] ?? null,
            ]);

            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Update reservation references
            foreach ($reservations as $reservation) {
                $reservation->update(['order_reference' => $order->order_number]);
            }

            // Step 4: Create Stripe PaymentIntent (always in order's currency)
            $paymentIntent = $this->payment->createIntent($order, $tenantId);

            // Mark cart as ordered
            $cart->update(['status' => 'ordered']);

            return [
                'order'          => $order->fresh('items'),
                'client_secret'  => $paymentIntent['client_secret'],
                'payment_intent' => $paymentIntent['id'],
            ];
        });
    }

    /**
     * Step 5: On payment success — confirm inventory, post ledger entries, emit OrderPaid event.
     *
     * Ledger entries use the order's immutable currency snapshot to ensure
     * financial records match the exact exchange rate at time of purchase.
     */
    public function onPaymentSuccess(Order $order, string $paymentIntentId, int $tenantId): void
    {
        DB::transaction(function () use ($order, $paymentIntentId, $tenantId) {
            // Confirm all inventory reservations for this order
            $reservations = InventoryReservation::where('order_reference', $order->order_number)
                ->where('status', 'pending')
                ->get();

            foreach ($reservations as $reservation) {
                $this->inventory->confirm($reservation);
            }

            // Update order status
            $order->update([
                'status'  => 'paid',
                'paid_at' => now(),
            ]);

            // Post ledger entries using order's immutable currency snapshot
            $this->ledger->post(
                "order_{$order->id}",
                "Payment received for order #{$order->order_number}",
                [
                    ['account_code' => 'CASH',    'type' => 'debit',  'amount' => $order->total, 'memo' => 'Customer payment'],
                    ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => $order->total, 'memo' => 'Sales revenue'],
                ],
                $tenantId,
                $order->currency_code,
                (float) $order->exchange_rate_snapshot
            );

            // Calculate commissions per order item
            foreach ($order->items as $item) {
                $this->commission->calculate($item, $tenantId);
            }
        });

        // Emit domain event (outside transaction for async handling)
        event(new OrderPaid($order));
    }

    /**
     * Step 6: On failure — release inventory, cancel order.
     */
    public function onPaymentFailure(Order $order): void
    {
        DB::transaction(function () use ($order) {
            $reservations = InventoryReservation::where('order_reference', $order->order_number)
                ->where('status', 'pending')
                ->get();

            foreach ($reservations as $reservation) {
                $this->inventory->release($reservation);
            }

            $order->update(['status' => 'cancelled']);
        });

        event(new OrderCancelled($order));
    }
}
