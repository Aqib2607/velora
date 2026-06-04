<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Models\Order;
use App\Models\Payout;
use App\Models\Product;
use App\Models\SellerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    /**
     * Ensure the user has a seller profile, or abort with 403.
     */
    private function getSellerProfile(Request $request): SellerProfile
    {
        $profile = SellerProfile::where('user_id', $request->user()->id)->first();
        if (! $profile) {
            abort(403, 'Seller profile required. Please complete your seller application first.');
        }
        if ($profile->status !== 'active') {
            abort(403, 'Your seller account is not yet active. Status: ' . $profile->status);
        }
        return $profile;
    }

    // ──────────────────────────────────────────────────────
    // Stats — Dashboard summary
    // ──────────────────────────────────────────────────────

    public function stats(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $totalRevenue = \App\Models\OrderItem::where('seller_profile_id', $profile->id)
            ->whereHas('order', fn ($q) => $q->where('status', 'paid'))
            ->sum('subtotal');

        $totalOrders = Order::whereHas('items', fn ($q) => $q->where('seller_profile_id', $profile->id))
            ->count();

        $activeProducts = Product::where('seller_profile_id', $profile->id)
            ->where('status', 'published')
            ->count();

        $totalRefunds = \App\Models\Refund::whereHas('order', function ($q) use ($profile) {
            $q->whereHas('items', fn ($iq) => $iq->where('seller_profile_id', $profile->id));
        })->count();

        $refundRate = $totalOrders > 0
            ? round(($totalRefunds / $totalOrders) * 100, 2)
            : 0.0;

        $pendingPayouts = Payout::where('seller_profile_id', $profile->id)
            ->where('status', 'pending')
            ->sum('amount');

        return response()->json([
            'status' => 'success',
            'data'   => [
                'revenue'         => (float) $totalRevenue,
                'orders'          => $totalOrders,
                'active_products' => $activeProducts,
                'refund_rate'     => $refundRate,
                'pending_payouts' => (float) $pendingPayouts,
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────
    // Products
    // ──────────────────────────────────────────────────────

    public function products(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $products = Product::where('seller_profile_id', $profile->id)
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function createProduct(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'required|string',
            'price'       => 'required|numeric|min:0.01',
            'category_id' => 'required|exists:categories,id',
            'status'      => 'in:draft,published',
            'stock'       => 'integer|min:0',
        ]);

        $product = Product::create([
            'seller_profile_id' => $profile->id,
            'tenant_id'         => app('tenant')->id,
            'name'              => $validated['name'],
            'description'       => $validated['description'],
            'price'             => $validated['price'],
            'category_id'       => $validated['category_id'],
            'status'            => $validated['status'] ?? 'draft',
            'slug'              => \Illuminate\Support\Str::slug($validated['name']) . '-' . uniqid(),
        ]);

        return response()->json(['status' => 'success', 'data' => $product], 201);
    }

    public function updateProduct(Request $request, Product $product): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        // Ensure this product belongs to the requesting seller
        if ($product->seller_profile_id !== $profile->id) {
            abort(403, 'You do not own this product.');
        }

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price'       => 'sometimes|numeric|min:0.01',
            'category_id' => 'sometimes|exists:categories,id',
            'status'      => 'sometimes|in:draft,published,archived',
        ]);

        $product->update($validated);

        return response()->json(['status' => 'success', 'data' => $product->fresh()]);
    }

    public function deleteProduct(Request $request, Product $product): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        if ($product->seller_profile_id !== $profile->id) {
            abort(403, 'You do not own this product.');
        }

        $product->update(['status' => 'archived']); // Soft-archive, not hard-delete

        return response()->json(['status' => 'success', 'data' => ['message' => 'Product archived.']]);
    }

    // ──────────────────────────────────────────────────────
    // Orders
    // ──────────────────────────────────────────────────────

    public function orders(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $orders = Order::whereHas('items', fn ($q) => $q->where('seller_profile_id', $profile->id))
            ->with(['items' => fn ($q) => $q->where('seller_profile_id', $profile->id), 'user:id,name,email'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    // ──────────────────────────────────────────────────────
    // Payouts
    // ──────────────────────────────────────────────────────

    public function payouts(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $payouts = Payout::where('seller_profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        $summary = [
            'total_paid'    => Payout::where('seller_profile_id', $profile->id)->where('status', 'paid')->sum('amount'),
            'total_pending' => Payout::where('seller_profile_id', $profile->id)->where('status', 'pending')->sum('amount'),
        ];

        return response()->json([
            'status' => 'success',
            'data'   => ['payouts' => $payouts, 'summary' => $summary],
        ]);
    }
}
