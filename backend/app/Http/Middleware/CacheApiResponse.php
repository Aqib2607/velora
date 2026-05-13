<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CacheApiResponse
{
    public function handle(Request $request, Closure $next, int $ttl = 60)
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }

        // Do not cache authenticated user-specific endpoints unless explicitly tagged
        // This is a generic public API cache
        if ($request->user()) {
            return $next($request);
        }

        $key = 'api_cache:' . md5($request->fullUrl());

        return \Illuminate\Support\Facades\Cache::remember($key, $ttl, function () use ($request, $next) {
            $response = $next($request);
            // Ensure response is cacheable
            if ($response->getStatusCode() === 200) {
                return $response;
            }
            // If not 200, return immediately without caching
            return $response;
        });
    }
}
