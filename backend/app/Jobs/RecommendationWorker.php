<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;

class RecommendationWorker implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(): void
    {
        // 1. Calculate Trending by Region
        $trending = DB::table('orders')
            ->join('order_items', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.created_at', '>=', now()->subDays(7))
            ->select('orders.region_code', 'order_items.product_id', DB::raw('COUNT(*) as sales'))
            ->groupBy('orders.region_code', 'order_items.product_id')
            ->orderByDesc('sales')
            ->get()
            ->groupBy('region_code');

        foreach ($trending as $regionCode => $products) {
            // Store top 20 trending products per region
            $topProductIds = $products->take(20)->pluck('product_id')->toArray();
            // Store in Redis (tenant isolated, assuming default tenant logic or grouped by tenant)
            // Simplified for demonstration
            Redis::set("recommendations:trending:{$regionCode}:tenant:1", json_encode($topProductIds));
        }

        // 2. Calculate Frequently Bought Together (FBT)
        // ... heavy ML/Association Rule calculations would run here or externally ...
    }
}
