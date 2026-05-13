<?php

namespace App\Modules\Intelligence;

use App\Models\Order;
use Illuminate\Support\Facades\Redis;

class FraudScoreService
{
    /**
     * Calculate risk score for a checkout attempt (0.0 to 1.0)
     */
    public function calculateRisk(array $checkoutData, string $ipAddress, int $userId): float
    {
        $score = 0.0;

        // 1. Velocity Check (Rapid checkout attempts)
        $attempts = Redis::get("fraud:velocity:{$userId}");
        if ($attempts > 5) {
            $score += 0.4;
        }

        // 2. GeoIP Mismatch (IP region vs Shipping region)
        // Mock geo detection
        $ipRegion = 'US'; // In reality, from GeoIP db
        if ($ipRegion !== ($checkoutData['shipping_region'] ?? 'US')) {
            $score += 0.3;
        }

        // 3. High Value / Anomaly
        if (($checkoutData['total'] ?? 0) > 2000) {
            $score += 0.15;
        }

        return min($score, 1.0);
    }

    /**
     * Mark an order as suspicious and freeze fulfillment.
     */
    public function flagOrder(Order $order, float $riskScore): void
    {
        $order->update([
            'status' => 'manual_review',
            'fraud_score' => $riskScore
        ]);

        // Alert fraud team via internal notification/webhook
        event(new \App\Events\SuspiciousOrderFlagged($order));
    }
}
