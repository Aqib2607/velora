<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Refund;
use App\Modules\Refund\RefundService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RefundController extends Controller
{
    public function __construct(private readonly RefundService $refunds) {}

    public function index(Request $request): JsonResponse
    {
        $refunds = Refund::where('requested_by', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json(['status' => 'success', 'data' => $refunds]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount'   => 'required|numeric|min:0.01',
            'reason'   => 'nullable|string|max:1000',
        ]);

        $order  = Order::findOrFail($validated['order_id']);
        $this->authorize('view', $order);

        $refund = $this->refunds->request(
            $order,
            $request->user()->id,
            $validated['amount'],
            $validated['reason'] ?? null
        );

        return response()->json(['status' => 'success', 'data' => $refund], 201);
    }

    public function approve(Refund $refund): JsonResponse
    {
        $this->authorize('approve', $refund);
        $this->refunds->approve($refund);

        return response()->json(['status' => 'success', 'data' => $refund->fresh()]);
    }

    public function reject(Request $request, Refund $refund): JsonResponse
    {
        $this->authorize('reject', $refund);
        $reason = $request->validate(['reason' => 'required|string'])['reason'];
        $this->refunds->reject($refund, $reason);

        return response()->json(['status' => 'success', 'data' => $refund->fresh()]);
    }
}
