<?php

namespace App\Modules\Intelligence;

use Illuminate\Support\Facades\Redis;

class RecommendationService
{
    /**
     * Get personalized product recommendations using collaborative filtering (cached in Redis).
     */
    public function getPersonalizedFeed(int $userId, int $tenantId, string $regionCode): array
    {
        $cacheKey = "recommendations:user:{$userId}:tenant:{$tenantId}";
        
        $cached = Redis::get($cacheKey);
        if ($cached) {
            return json_decode($cached, true);
        }

        // Fallback: If no personalized model exists yet, return regional trending
        return $this->getTrendingByRegion($tenantId, $regionCode);
    }

    /**
     * Get frequently bought together products (basket analysis).
     */
    public function getFrequentlyBoughtTogether(int $productId, int $tenantId): array
    {
        $cacheKey = "recommendations:fbt:{$productId}:tenant:{$tenantId}";
        
        $cached = Redis::get($cacheKey);
        if ($cached) {
            return json_decode($cached, true);
        }

        return [];
    }

    /**
     * Get trending products by region.
     */
    public function getTrendingByRegion(int $tenantId, string $regionCode): array
    {
        $cacheKey = "recommendations:trending:{$regionCode}:tenant:{$tenantId}";
        
        $cached = Redis::get($cacheKey);
        if ($cached) {
            return json_decode($cached, true);
        }

        // Default empty state, populated by RecommendationWorker
        return [];
    }

    /**
     * Track user activity for the ML pipeline
     */
    public function trackActivity(int $userId, string $action, array $metadata): void
    {
        // Emit event to Kafka/Redpanda for model training
        // Example: ['user_id' => 123, 'action' => 'view_product', 'product_id' => 456]
        event(new \App\Events\UserActivityLogged($userId, $action, $metadata));
    }
}
