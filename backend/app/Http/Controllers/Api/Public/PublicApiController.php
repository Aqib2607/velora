<?php

namespace App\Http\Controllers\Api\Public;

use App\Models\Product;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class PublicApiController extends Controller
{
    /**
     * Public API Gateway for accessing products via Developer Token (OAuth2/Bearer).
     */
    public function getProducts(Request $request): JsonResponse
    {
        // Handled by Sanctum / Passport token abilities
        if (!$request->user()->tokenCan('read:products')) {
            abort(403, 'Missing read:products scope');
        }

        $products = Product::where('tenant_id', app('tenant')->id)
            ->where('status', 'published')
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $products
        ]);
    }

    /**
     * Fetch orders for the developer's connected seller account.
     */
    public function getOrders(Request $request): JsonResponse
    {
        if (!$request->user()->tokenCan('read:orders')) {
            abort(403, 'Missing read:orders scope');
        }

        $orders = Order::whereHas('items', function ($q) use ($request) {
                // Simplified constraint
                $q->where('seller_id', $request->user()->id); 
            })
            ->with('items')
            ->paginate(50);

        return response()->json([
            'status' => 'success',
            'data' => $orders
        ]);
    }
}
