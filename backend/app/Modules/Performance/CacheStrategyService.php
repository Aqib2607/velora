<?php

namespace App\Modules\Performance;

use Illuminate\Support\Facades\Cache;
use Closure;

class CacheStrategyService
{
    /**
     * Cache catalog queries with high TTL (invalidated on product update)
     */
    public function rememberCatalog(string $key, int $tenantId, Closure $callback)
    {
        return Cache::tags(['catalog', "tenant:{$tenantId}"])->remember($key, 3600, $callback);
    }

    /**
     * Cache dashboard aggregations with low TTL (near real-time but debounced)
     */
    public function rememberDashboardStats(int $sellerId, Closure $callback)
    {
        return Cache::tags(['dashboard', "seller:{$sellerId}"])->remember("stats:{$sellerId}", 60, $callback);
    }

    /**
     * Invalidate catalog cache for a tenant
     */
    public function invalidateCatalog(int $tenantId): void
    {
        Cache::tags(['catalog', "tenant:{$tenantId}"])->flush();
    }
}
