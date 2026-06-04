<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * RequirePermission — Reusable permission-enforcement middleware.
 *
 * Usage in routes:
 *   Route::middleware('permission:view-orders')->group(...)
 */
class RequirePermission
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$permissions): mixed
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        // Ideally this should check a permissions table. For Phase 1 we will just assume roles map to permissions or mock it.
        // Actually, if we have a robust RBAC, we would check $user->hasPermissionTo().
        // For now, we will just allow it if they are admin, or return 403.
        if ($user->hasRole('admin')) {
            return $next($request);
        }

        // TODO: Implement actual permission matrix checking based on roles.
        // For Phase 1, we will rely primarily on RequireRole.
        return response()->json([
            'status'  => 'error',
            'message' => 'Insufficient permissions. Required permission(s): ' . implode(', ', $permissions),
        ], 403);
    }

    public static function using(string ...$permissions): string
    {
        return 'permission:' . implode(',', $permissions);
    }
}
