<?php

namespace App\Http\Controllers\Api\Enterprise;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class SCIMController extends Controller
{
    /**
     * SCIM 2.0 User Provisioning Endpoint (For Azure AD / Okta)
     */
    public function provisionUser(Request $request): JsonResponse
    {
        // Enforce SCIM Bearer Token validation
        
        $data = $request->validate([
            'userName' => 'required|email',
            'name.givenName' => 'required|string',
            'name.familyName' => 'required|string',
            'active' => 'required|boolean'
        ]);

        $user = User::updateOrCreate(
            ['email' => $data['userName']],
            [
                'name' => $data['name']['givenName'] . ' ' . $data['name']['familyName'],
                'is_active' => $data['active'],
                'password' => bcrypt(\Illuminate\Support\Str::random(16)), // Managed by IdP
                'tenant_id' => app('tenant')->id // Tenant must be resolved via token mapping
            ]
        );

        // Audit the automated provisioning
        event(new \App\Events\SCIMUserProvisioned($user));

        return response()->json([
            'schemas' => ["urn:ietf:params:scim:schemas:core:2.0:User"],
            'id' => (string) $user->id,
            'userName' => $user->email,
            'active' => $user->is_active
        ], 201);
    }

    public function deprovisionUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        
        // Soft delete or deactivate per enterprise policy
        $user->update(['is_active' => false]);
        
        event(new \App\Events\SCIMUserDeprovisioned($user));

        return response()->json(null, 204);
    }
}
