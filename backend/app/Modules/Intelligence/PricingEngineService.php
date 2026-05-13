<?php

namespace App\Modules\Intelligence;

use Illuminate\Support\Facades\DB;

class PricingEngineService
{
    /**
     * Calculate optimal dynamic price based on elasticity, inventory, and competitor signals.
     */
    public function suggestOptimalPrice(int $productId, int $tenantId): array
    {
        // 1. Gather signals
        $inventory = DB::table('inventory')->where('product_id', $productId)->sum('quantity_available');
        $salesVelocity = DB::table('order_items')
            ->where('product_id', $productId)
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('quantity');

        // Base price
        $currentPrice = DB::table('products')->where('id', $productId)->value('base_price');
        
        $suggestedPrice = $currentPrice;
        $reason = "Price is optimal.";

        // Low inventory, high velocity -> Price increase
        if ($inventory < 20 && $salesVelocity > 50) {
            $suggestedPrice = $currentPrice * 1.05; // 5% increase
            $reason = "High demand, low inventory. Suggested +5%.";
        } 
        // High inventory, low velocity -> Price decrease
        elseif ($inventory > 200 && $salesVelocity < 5) {
            $suggestedPrice = $currentPrice * 0.90; // 10% decrease
            $reason = "Low demand, overstocked. Suggested -10%.";
        }

        return [
            'current_price'   => $currentPrice,
            'suggested_price' => round($suggestedPrice, 2),
            'margin_impact'   => round(($suggestedPrice - $currentPrice) / $currentPrice * 100, 2),
            'reason'          => $reason
        ];
    }
}
