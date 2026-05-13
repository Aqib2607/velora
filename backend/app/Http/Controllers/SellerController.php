<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Payout;
use App\Models\SellerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SellerController extends Controller
{
    /**
     * Ensure the user has a seller profile, or return 403.
     */
    private function getSellerProfile(Request $request): SellerProfile
    {
        $profile = SellerProfile::where('user_id', $request->user()->id)->first();
        if (!$profile) {
            abort(403, 'Seller profile required.');
        }
        return $profile;
    }

    public function stats(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        // Fetch basic stats for the dashboard
        $stats = [
            'revenue' => Order::whereHas('items', function ($q) use ($profile) {
                $q->where('seller_profile_id', $profile->id);
            })->where('status', 'paid')->sum('total'),
            'orders' => Order::whereHas('items', function ($q) use ($profile) {
                $q->where('seller_profile_id', $profile->id);
            })->count(),
            'active_products' => Product::where('seller_profile_id', $profile->id)->where('status', 'published')->count(),
            'refund_rate' => 1.5, // Mocked for now
        ];

        return response()->json(['status' => 'success', 'data' => $stats]);
    }

    public function products(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $products = Product::where('seller_profile_id', $profile->id)
            ->with(['skus' => function ($q) {
                $q->withSum('inventory', 'quantity_available');
            }])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function orders(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        $orders = Order::whereHas('items', function ($q) use ($profile) {
                $q->where('seller_profile_id', $profile->id);
            })
            ->with(['items' => function ($q) use ($profile) {
                $q->where('seller_profile_id', $profile->id);
            }])
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    public function payouts(Request $request): JsonResponse
    {
        $profile = $this->getSellerProfile($request);

        // Payouts might not exist yet, using dummy relation or skip if not ready.
        // Assuming Payouts are linked to seller profile.
        $payouts = Payout::where('seller_profile_id', $profile->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $payouts]);
    }
}
