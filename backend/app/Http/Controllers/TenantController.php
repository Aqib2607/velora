<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantController extends Controller
{
    /**
     * Assert the authenticated user has the 'super_admin' role.
     */
    private function assertSuperAdmin(): void
    {
        $user = request()->user();

        $isSuperAdmin = $user->roles()
            ->where('name', 'super_admin')
            ->exists();

        if (! $isSuperAdmin) {
            abort(403, 'Insufficient privileges. Super Admin role required for tenant operations.');
        }
    }

    public function index(Request $request): JsonResponse
    {
        $this->assertSuperAdmin();

        $tenants = Tenant::when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('domain', 'like', "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json(['status' => 'success', 'data' => $tenants]);
    }

    public function store(Request $request): JsonResponse
    {
        $this->assertSuperAdmin();

        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'slug'     => 'required|string|max:255|unique:tenants,slug',
            'domain'   => 'nullable|string|max:255|unique:tenants,domain',
            'status'   => 'required|in:active,suspended',
            'plan'     => 'required|string|max:50',
            'settings' => 'nullable|array',
        ]);

        $tenant = Tenant::create($validated);

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => $tenant->id,
            'action'    => 'tenant_created',
            'details'   => $validated,
        ]);

        return response()->json(['status' => 'success', 'data' => $tenant], 201);
    }

    public function show(Tenant $tenant): JsonResponse
    {
        $this->assertSuperAdmin();
        return response()->json(['status' => 'success', 'data' => $tenant]);
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertSuperAdmin();

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'slug'     => 'sometimes|string|max:255|unique:tenants,slug,' . $tenant->id,
            'domain'   => 'nullable|string|max:255|unique:tenants,domain,' . $tenant->id,
            'status'   => 'sometimes|in:active,suspended',
            'plan'     => 'sometimes|string|max:50',
            'settings' => 'nullable|array',
        ]);

        $tenant->update($validated);

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => $tenant->id,
            'action'    => 'tenant_updated',
            'details'   => $validated,
        ]);

        return response()->json(['status' => 'success', 'data' => $tenant->fresh()]);
    }

    public function destroy(Request $request, Tenant $tenant): JsonResponse
    {
        $this->assertSuperAdmin();

        $tenant->update(['status' => 'suspended']);
        $tenant->delete(); // Soft delete

        AuditLog::create([
            'user_id'   => $request->user()->id,
            'tenant_id' => $tenant->id,
            'action'    => 'tenant_deleted',
            'details'   => ['tenant_id' => $tenant->id],
        ]);

        return response()->json(['status' => 'success', 'data' => ['message' => 'Tenant successfully suspended and deleted.']]);
    }
}
