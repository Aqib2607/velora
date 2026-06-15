<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AdminController extends Controller
{
    /**
     * Assert the authenticated user has the 'super_admin' or 'marketplace_admin' role.
     * Throws a 403 if the check fails.
     */
    private function assertAdmin(): void
    {
        $user = request()->user();

        $isAdmin = $user->roles()
            ->whereIn('name', ['super_admin', 'marketplace_admin', 'finance_admin'])
            ->exists();

        if (! $isAdmin) {
            abort(403, 'Insufficient privileges. Admin role required.');
        }
    }

    // ── Users ──────────────────────────────────────────────

    public function users(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $users = User::with('roles')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")
                ->orWhere('email', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['status' => 'success', 'data' => $users]);
    }

    public function suspendUser(Request $request, User $user): JsonResponse
    {
        $this->assertAdmin();
        $user->update(['status' => 'suspended']);
        return response()->json(['status' => 'success', 'data' => ['message' => 'User suspended.']]);
    }

    public function banUser(Request $request, User $user): JsonResponse
    {
        $this->assertAdmin();
        $user->update(['status' => 'banned']);
        return response()->json(['status' => 'success', 'data' => ['message' => 'User banned.']]);
    }

    // ── Products ───────────────────────────────────────────

    public function products(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $products = \App\Models\Product::with('sellerProfile.user', 'category')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function suspendProduct(Request $request, \App\Models\Product $product): JsonResponse
    {
        $this->assertAdmin();
        $product->update(['status' => 'archived']);
        return response()->json(['status' => 'success', 'data' => ['message' => 'Product suspended.']]);
    }

    public function deleteProduct(Request $request, \App\Models\Product $product): JsonResponse
    {
        $this->assertAdmin();
        $product->delete();
        return response()->json(['status' => 'success', 'data' => ['message' => 'Product deleted.']]);
    }

    // ── Refunds ────────────────────────────────────────────

    public function refunds(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $refunds = \App\Models\Refund::with('order.user')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['status' => 'success', 'data' => $refunds]);
    }

    // ── Orders ─────────────────────────────────────────────

    public function orders(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $orders = Order::with('user', 'items')
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->when($request->tenant_id, fn ($q, $t) => $q->where('tenant_id', $t))
            ->when($request->search, fn ($q, $s) => $q->where('order_number', 'like', "%{$s}%"))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['status' => 'success', 'data' => $orders]);
    }

    // ── Reports / GMV dashboard ────────────────────────────

    public function reports(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $tenantId = app('tenant')->id;

        $report = [
            'total_orders'      => Order::where('tenant_id', $tenantId)->count(),
            'paid_orders'       => Order::where('tenant_id', $tenantId)->where('status', 'paid')->count(),
            'total_revenue'     => Order::where('tenant_id', $tenantId)->where('status', 'paid')->sum('total'),
            'orders_today'      => Order::where('tenant_id', $tenantId)->whereDate('created_at', today())->count(),
            'active_sellers'    => \App\Models\SellerProfile::where('status', 'active')->count(),
            'pending_sellers'   => \App\Models\SellerProfile::where('status', 'pending')->count(),
            'refund_rate'       => $this->calculateRefundRate($tenantId),
        ];

        return response()->json(['status' => 'success', 'data' => $report]);
    }

    // ── Seller management ──────────────────────────────────

    public function approveSeller(Request $request, \App\Models\SellerApplication $application): JsonResponse
    {
        $this->assertAdmin();

        $application->update(['status' => 'approved']);

        // Activate seller profile
        $application->sellerProfile()->update(['status' => 'active']);

        // Assign seller role to user
        $role = \App\Models\Role::where('name', 'seller')->first();
        if ($role) {
            $application->user->roles()->syncWithoutDetaching([$role->id]);
        }

        return response()->json(['status' => 'success', 'data' => ['message' => 'Seller approved.']]);
    }

    public function rejectSeller(Request $request, \App\Models\SellerApplication $application): JsonResponse
    {
        $this->assertAdmin();

        $request->validate(['reason' => 'nullable|string|max:500']);

        $application->update([
            'status' => 'rejected',
            'notes'  => $request->reason,
        ]);

        return response()->json(['status' => 'success', 'data' => ['message' => 'Seller rejected.']]);
    }

    // ── Audit logs ─────────────────────────────────────────

    public function auditLogs(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $logs = AuditLog::with('user')
            ->when($request->actor,  fn ($q, $a) => $q->where('user_id', $a))
            ->when($request->action, fn ($q, $a) => $q->where('action', 'like', "%{$a}%"))
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json(['status' => 'success', 'data' => $logs]);
    }

    // ── Helpers ────────────────────────────────────────────

    private function calculateRefundRate(int $tenantId): float
    {
        $totalPaid   = Order::where('tenant_id', $tenantId)->where('status', 'paid')->count();
        $totalRefund = Order::where('tenant_id', $tenantId)->where('status', 'refunded')->count();

        if ($totalPaid === 0) return 0.0;
        return round(($totalRefund / $totalPaid) * 100, 2);
    }
}
