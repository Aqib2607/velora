<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Sku;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $cart = Cart::with('items.sku.product')
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->first();

        return response()->json(['status' => 'success', 'data' => $cart]);
    }

    public function addItem(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku_id'   => 'required|exists:skus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $sku  = Sku::findOrFail($validated['sku_id']);
        $cart = Cart::firstOrCreate(
            ['user_id' => $request->user()->id, 'status' => 'active'],
            ['tenant_id' => app('tenant')->id]
        );

        $item = $cart->items()->where('sku_id', $sku->id)->first();
        if ($item) {
            $item->increment('quantity', $validated['quantity']);
        } else {
            $cart->items()->create([
                'sku_id'     => $sku->id,
                'quantity'   => $validated['quantity'],
                'unit_price' => $sku->price,
            ]);
        }

        return response()->json(['status' => 'success', 'data' => $cart->fresh('items.sku')], 201);
    }

    public function removeItem(Request $request, CartItem $item): JsonResponse
    {
        $item->delete();
        return response()->json(['status' => 'success', 'data' => ['message' => 'Item removed.']]);
    }

    public function updateItem(Request $request, CartItem $item): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);
        $item->update(['quantity' => $validated['quantity']]);
        return response()->json(['status' => 'success', 'data' => $item->cart->fresh('items.sku')]);
    }

    public function clear(Request $request): JsonResponse
    {
        Cart::where('user_id', $request->user()->id)->where('status', 'active')
            ->first()?->items()->delete();

        return response()->json(['status' => 'success', 'data' => ['message' => 'Cart cleared.']]);
    }
}
