<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * RequireRole — Reusable role-enforcement middleware.
 *
 * Usage in routes:
 *   Route::middleware('role:admin')->group(...)
 *   Route::middleware('role:seller,admin')->group(...)
 *
 * Usage via factory pattern:
 *   RequireRole::using('admin')
 *
 * Roles are checked against the user's pivot-attached roles via roles() relationship.
 */
class RequireRole
{
    /**
     * Handle an incoming request.
     *
     * @param  string  $roles  Comma-separated list of allowed roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthenticated.'], 401);
        }

        $userRoles = $user->roles()->pluck('name')->toArray();

        foreach ($roles as $role) {
            if (in_array($role, $userRoles, true)) {
                return $next($request);
            }
        }

        return response()->json([
            'status'  => 'error',
            'message' => 'Insufficient privileges. Required role(s): ' . implode(', ', $roles),
        ], 403);
    }

    /**
     * Factory helper for programmatic middleware attachment.
     *
     * Example:
     *   Route::middleware([RequireRole::using('admin')])->group(...)
     */
    public static function using(string ...$roles): string
    {
        return 'role:' . implode(',', $roles);
    }
}
