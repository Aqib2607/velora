<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\CommissionRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommissionController extends Controller
{
    /**
     * Assert the authenticated user has the 'marketplace_admin' or 'super_admin' role.
     */
    private function assertAdmin(): void
    {
        $user = request()->user();

        $isAdmin = $user->roles()
            ->whereIn('name', ['super_admin', 'marketplace_admin'])
            ->exists();

        if (! $isAdmin) {
            abort(403, 'Insufficient privileges. Marketplace Admin role required.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $rules = CommissionRule::with('category')
            ->where('tenant_id', app('tenant')->id)
            ->when($request->type, fn ($q, $t) => $q->where('type', $t))
            ->orderBy('category_id')
            ->paginate(50);

        return response()->json(['status' => 'success', 'data' => $rules]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->assertAdmin();

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'type'        => 'required|string|in:flat,percentage,tiered',
            'rate'        => 'required|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_default'  => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $rule = CommissionRule::create(array_merge($validated, [
            'tenant_id' => app('tenant')->id,
        ]));

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => app('tenant')->id,
            'action'    => 'commission_rule_created',
            'details'   => $validated,
        ]);

        return response()->json(['status' => 'success', 'data' => $rule], 201);
    }

    public function show(CommissionRule $commissionRule): JsonResponse
    {
        $this->assertAdmin();

        if ($commissionRule->tenant_id !== app('tenant')->id) {
            abort(403, 'Unauthorized.');
        }

        return response()->json(['status' => 'success', 'data' => $commissionRule->load('category')]);
    }

    public function update(Request $request, CommissionRule $commissionRule): JsonResponse
    {
        $this->assertAdmin();

        if ($commissionRule->tenant_id !== app('tenant')->id) {
            abort(403, 'Unauthorized.');
        }

        $validated = $request->validate([
            'name'        => 'sometimes|string|max:255',
            'type'        => 'sometimes|string|in:flat,percentage,tiered',
            'rate'        => 'sometimes|numeric|min:0',
            'category_id' => 'nullable|exists:categories,id',
            'is_default'  => 'sometimes|boolean',
            'is_active'   => 'sometimes|boolean',
        ]);

        $commissionRule->update($validated);

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => app('tenant')->id,
            'action'    => 'commission_rule_updated',
            'details'   => $validated,
        ]);

        return response()->json(['status' => 'success', 'data' => $commissionRule->fresh('category')]);
    }

    public function destroy(Request $request, CommissionRule $commissionRule): JsonResponse
    {
        $this->assertAdmin();

        if ($commissionRule->tenant_id !== app('tenant')->id) {
            abort(403, 'Unauthorized.');
        }

        $commissionRule->update(['is_active' => false]);

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => app('tenant')->id,
            'action'    => 'commission_rule_deactivated',
            'details'   => ['rule_id' => $commissionRule->id],
        ]);

        return response()->json(['status' => 'success', 'data' => ['message' => 'Commission rule deactivated.']]);
    }
}
