<?php

namespace App\Http\Controllers;

use App\Http\Requests\Order\StoreOrderRequest;
use App\Models\Cart;
use App\Models\Order;
use App\Modules\Order\OrderSagaOrchestrator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderSagaOrchestrator $saga) {}

    public function index(Request $request): JsonResponse
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    public function show(Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        return response()->json([
            'status' => 'success',
            'data'   => $order->load(['items.sku', 'payment', 'refunds']),
        ]);
    }

    /**
     * Initiate checkout — idempotency via Idempotency-Key header.
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $cart = Cart::where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->with('items.sku.product.sellerProfile')
            ->firstOrFail();

        $validated = $request->validated();

        $currencyData = [
            'currency_code' => $validated['currency_code'] ?? 'USD',
            'exchange_rate'  => $validated['exchange_rate'] ?? 1.0,
            'region_code'    => $validated['region_code'] ?? null,
        ];

        $result = $this->saga->initiateCheckout(
            $cart,
            $validated,
            app('tenant')->id,
            $currencyData
        );

        return response()->json(['status' => 'success', 'data' => $result], 201);
    }

    public function cancel(Order $order): JsonResponse
    {
        $this->authorize('update', $order);

        if (!$order->isCancellable()) {
            return response()->json([
                'status'     => 'error',
                'message'    => 'Order cannot be cancelled in its current state.',
                'error_code' => 'ORDER_NOT_CANCELLABLE',
            ], 422);
        }

        $this->saga->onPaymentFailure($order);

        return response()->json(['status' => 'success', 'data' => ['message' => 'Order cancelled.']]);
    }
}
