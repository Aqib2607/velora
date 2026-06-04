<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

/**
 * PHP HTTP client bridge to the Python FastAPI ML inference micro-service.
 * Falls back to deterministic heuristics if the ML service is unavailable.
 */
class MLInferenceService
{
    private string $inferenceUrl;
    private int $timeout = 2; // 2-second timeout for real-time fraud checks

    public function __construct()
    {
        $this->inferenceUrl = config('ml.inference_url', 'http://ml-inference-service:8080/api/v1');
    }

    // ──────────────────────────────────────────────────────────
    // Public API
    // ──────────────────────────────────────────────────────────

    /**
     * Detect fraud for a transaction in real-time.
     */
    public function detectFraud(array $transaction): array
    {
        $cacheKey = "fraud_pred:{$transaction['transaction_id']}";

        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        try {
            $payload = [
                'transaction_id'    => $transaction['transaction_id'],
                'merchant_id'       => $transaction['merchant_id'],
                'customer_id'       => $transaction['customer_id'],
                'amount'            => $transaction['amount'],
                'currency'          => $transaction['currency'],
                'payment_method'    => $transaction['payment_method'],
                'device_fingerprint'=> $transaction['device_fingerprint'] ?? '',
                'ip_address'        => $transaction['ip_address'],
                'billing_country'   => $transaction['billing_country'],
                'shipping_country'  => $transaction['shipping_country'] ?? $transaction['billing_country'],
            ];

            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/fraud-detection",
                $payload
            );

            if (! $response->successful()) {
                Log::warning('Fraud detection ML service returned non-2xx', ['status' => $response->status()]);
                return $this->fallbackFraudDetection($transaction);
            }

            $result = $response->json();
            Cache::put($cacheKey, $result, 300); // 5-minute TTL
            return $result;

        } catch (\Exception $e) {
            Log::error('Fraud detection exception', ['error' => $e->getMessage()]);
            return $this->fallbackFraudDetection($transaction);
        }
    }

    /**
     * Predict chargeback risk for a transaction.
     */
    public function predictChargebackRisk(array $transaction): array
    {
        try {
            $payload = [
                'transaction_id'   => $transaction['transaction_id'],
                'merchant_id'      => $transaction['merchant_id'],
                'customer_id'      => $transaction['customer_id'],
                'amount'           => $transaction['amount'],
                'product_category' => $transaction['product_category'] ?? 'general',
            ];

            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/chargeback-prediction",
                $payload
            );

            if (! $response->successful()) {
                Log::warning('Chargeback prediction failed', ['status' => $response->status()]);
                return ['risk_level' => 'medium', 'risk_score' => 0.5];
            }

            return $response->json();

        } catch (\Exception $e) {
            Log::error('Chargeback prediction exception', ['error' => $e->getMessage()]);
            return ['risk_level' => 'medium', 'risk_score' => 0.5];
        }
    }

    /**
     * Score merchant risk level (cached 12 hours).
     */
    public function scoreMerchantRisk(string $merchantId): array
    {
        $cacheKey = "merchant_risk:{$merchantId}";

        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }

        try {
            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/merchant-risk-score",
                ['merchant_id' => $merchantId]
            );

            if (! $response->successful()) {
                return ['risk_level' => 'medium', 'risk_score' => 0.5];
            }

            $result = $response->json();
            Cache::put($cacheKey, $result, 43200); // 12-hour TTL
            return $result;

        } catch (\Exception $e) {
            Log::error('Merchant risk scoring exception', ['error' => $e->getMessage()]);
            return ['risk_level' => 'medium', 'risk_score' => 0.5];
        }
    }

    /**
     * Health-check the ML inference service.
     */
    public function healthCheck(): bool
    {
        try {
            $response = Http::timeout(1)->get("{$this->inferenceUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning('ML service health check failed', ['error' => $e->getMessage()]);
            return false;
        }
    }

    // ──────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────

    /**
     * Deterministic heuristic fallback used when the ML service is unavailable.
     * Keeps checkout flowing while flagging borderline transactions for review.
     */
    private function fallbackFraudDetection(array $transaction): array
    {
        $riskScore = 0.3; // default: low risk

        if (($transaction['billing_country'] ?? '') !== ($transaction['shipping_country'] ?? '')) {
            $riskScore += 0.2; // country mismatch
        }

        if (($transaction['amount'] ?? 0) > 500) {
            $riskScore += 0.15; // high-value transaction
        }

        $riskLevel = match (true) {
            $riskScore > 0.7 => 'high',
            $riskScore > 0.4 => 'medium',
            default          => 'low',
        };

        return [
            'risk_level'     => $riskLevel,
            'risk_score'     => $riskScore,
            'confidence'     => 0.5,
            'recommendation' => $riskScore > 0.7 ? 'REQUIRE_3D_SECURE' : 'APPROVE',
            'is_fallback'    => true,
        ];
    }
}
