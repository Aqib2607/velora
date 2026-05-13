"""
Backend ML Service Integration - PHP/Laravel integration with ML inference service
"""

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MLInferenceService
{
    private $inferenceUrl;
    private $timeout = 2;  // 2 second timeout for fraud detection
    
    public function __construct()
    {
        $this->inferenceUrl = config('ml.inference_url', 'http://ml-inference-service:8080/api/v1');
    }
    
    /**
     * Detect fraud for a transaction in real-time
     * 
     * @param array $transaction Transaction data
     * @return array Fraud detection result with risk level and score
     */
    public function detectFraud($transaction)
    {
        $cacheKey = "fraud_pred:{$transaction['transaction_id']}";
        
        // Check cache first
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }
        
        try {
            $payload = [
                'transaction_id' => $transaction['transaction_id'],
                'merchant_id' => $transaction['merchant_id'],
                'customer_id' => $transaction['customer_id'],
                'amount' => $transaction['amount'],
                'currency' => $transaction['currency'],
                'payment_method' => $transaction['payment_method'],
                'device_fingerprint' => $transaction['device_fingerprint'] ?? '',
                'ip_address' => $transaction['ip_address'],
                'billing_country' => $transaction['billing_country'],
                'shipping_country' => $transaction['shipping_country'] ?? $transaction['billing_country'],
            ];
            
            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/fraud-detection",
                $payload
            );
            
            if (!$response->successful()) {
                Log::warning("Fraud detection failed", ['status' => $response->status()]);
                // Fallback: approve transaction but flag for review
                return $this->fallbackFraudDetection($transaction);
            }
            
            $result = $response->json();
            
            // Cache result for 5 minutes
            Cache::put($cacheKey, $result, 300);
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Fraud detection exception", ['error' => $e->getMessage()]);
            return $this->fallbackFraudDetection($transaction);
        }
    }
    
    /**
     * Predict chargeback risk for a transaction
     * 
     * @param array $transaction Transaction data
     * @return array Chargeback prediction with risk level
     */
    public function predictChargebackRisk($transaction)
    {
        try {
            $payload = [
                'transaction_id' => $transaction['transaction_id'],
                'merchant_id' => $transaction['merchant_id'],
                'customer_id' => $transaction['customer_id'],
                'amount' => $transaction['amount'],
                'product_category' => $transaction['product_category'] ?? 'general',
            ];
            
            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/chargeback-prediction",
                $payload
            );
            
            if (!$response->successful()) {
                Log::warning("Chargeback prediction failed");
                return ['risk_level' => 'medium', 'risk_score' => 0.5];
            }
            
            return $response->json();
            
        } catch (\Exception $e) {
            Log::error("Chargeback prediction exception", ['error' => $e->getMessage()]);
            return ['risk_level' => 'medium', 'risk_score' => 0.5];
        }
    }
    
    /**
     * Score merchant risk level
     * 
     * @param string $merchantId Merchant ID
     * @return array Risk score result
     */
    public function scoreMerchantRisk($merchantId)
    {
        $cacheKey = "merchant_risk:{$merchantId}";
        
        // Check cache (12 hour TTL for merchant risk)
        if ($cached = Cache::get($cacheKey)) {
            return $cached;
        }
        
        try {
            $payload = [
                'merchant_id' => $merchantId,
            ];
            
            $response = Http::timeout($this->timeout)->post(
                "{$this->inferenceUrl}/merchant-risk-score",
                $payload
            );
            
            if (!$response->successful()) {
                return ['risk_level' => 'medium', 'risk_score' => 0.5];
            }
            
            $result = $response->json();
            Cache::put($cacheKey, $result, 43200);  // 12 hours
            
            return $result;
            
        } catch (\Exception $e) {
            Log::error("Merchant risk scoring exception", ['error' => $e->getMessage()]);
            return ['risk_level' => 'medium', 'risk_score' => 0.5];
        }
    }
    
    /**
     * Check ML inference service health
     * 
     * @return bool True if service is healthy
     */
    public function healthCheck()
    {
        try {
            $response = Http::timeout(1)->get("{$this->inferenceUrl}/health");
            return $response->successful();
        } catch (\Exception $e) {
            Log::warning("ML service health check failed", ['error' => $e->getMessage()]);
            return false;
        }
    }
    
    /**
     * Get model information
     * 
     * @return array Model versions and status
     */
    public function getModelInfo()
    {
        try {
            $response = Http::timeout(2)->get("{$this->inferenceUrl}/model-info");
            
            if ($response->successful()) {
                return $response->json();
            }
            
            return null;
        } catch (\Exception $e) {
            Log::error("Failed to get model info", ['error' => $e->getMessage()]);
            return null;
        }
    }
    
    /**
     * Fallback fraud detection when service is unavailable
     */
    private function fallbackFraudDetection($transaction)
    {
        // Simple heuristic-based fallback
        $risk_score = 0.3;  // Default low risk
        
        // Country mismatch
        if (($transaction['billing_country'] ?? '') !== ($transaction['shipping_country'] ?? '')) {
            $risk_score += 0.2;
        }
        
        // High amount
        if ($transaction['amount'] > 500) {
            $risk_score += 0.15;
        }
        
        $risk_level = match(true) {
            $risk_score > 0.7 => 'high',
            $risk_score > 0.4 => 'medium',
            default => 'low'
        };
        
        return [
            'risk_level' => $risk_level,
            'risk_score' => $risk_score,
            'confidence' => 0.5,
            'recommendation' => $risk_score > 0.7 ? 'REQUIRE_3D_SECURE' : 'APPROVE',
            'is_fallback' => true,
        ];
    }
}

namespace App\Http\Controllers;

use App\Services\MLInferenceService;
use App\Models\Transaction;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    private $mlService;
    
    public function __construct(MLInferenceService $mlService)
    {
        $this->mlService = $mlService;
    }
    
    /**
     * Process payment with ML-based fraud detection
     */
    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'merchant_id' => 'required|uuid',
            'customer_id' => 'required|uuid',
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|size:3',
            'payment_method' => 'required|string',
        ]);
        
        // Create transaction record
        $transaction = Transaction::create([
            'transaction_id' => \Str::uuid(),
            'merchant_id' => $validated['merchant_id'],
            'customer_id' => $validated['customer_id'],
            'amount' => $validated['amount'],
            'currency' => $validated['currency'],
            'payment_method' => $validated['payment_method'],
            'device_fingerprint' => $request->header('X-Device-Fingerprint'),
            'ip_address' => $request->ip(),
            'billing_country' => $request->input('billing_country'),
            'shipping_country' => $request->input('shipping_country'),
            'status' => 'pending_fraud_check',
        ]);
        
        // Run fraud detection
        $fraudResult = $this->mlService->detectFraud($transaction->toArray());
        $transaction->fraud_result = $fraudResult;
        $transaction->save();
        
        // Handle based on fraud risk
        if ($fraudResult['risk_level'] === 'critical') {
            $transaction->update(['status' => 'declined_fraud']);
            return response()->json([
                'status' => 'declined',
                'reason' => 'suspected_fraud',
                'risk_score' => $fraudResult['risk_score'],
            ], 403);
        } elseif ($fraudResult['risk_level'] === 'high') {
            // Require 3D Secure
            return response()->json([
                'status' => 'requires_3d_secure',
                'action_url' => route('payment.3d-secure', ['transaction_id' => $transaction->id]),
            ]);
        }
        
        // Process payment (simplified)
        try {
            $paymentResult = $this->processWithPaymentProcessor($transaction);
            
            $transaction->update([
                'status' => 'completed',
                'processor_result' => $paymentResult,
            ]);
            
            // Predict chargeback risk
            $chargebackRisk = $this->mlService->predictChargebackRisk($transaction->toArray());
            $transaction->update(['chargeback_risk' => $chargebackRisk]);
            
            return response()->json([
                'status' => 'success',
                'transaction_id' => $transaction->id,
                'amount' => $transaction->amount,
            ]);
            
        } catch (\Exception $e) {
            $transaction->update(['status' => 'failed']);
            return response()->json(['status' => 'failed', 'error' => $e->getMessage()], 400);
        }
    }
    
    /**
     * Merchant risk dashboard
     */
    public function getMerchantRiskAssessment(Request $request, $merchantId)
    {
        $riskScore = $this->mlService->scoreMerchantRisk($merchantId);
        
        return response()->json([
            'merchant_id' => $merchantId,
            'risk_level' => $riskScore['risk_level'],
            'risk_score' => $riskScore['risk_score'],
            'recommendation' => $riskScore['recommendation'],
            'timestamp' => now()->toIso8601String(),
        ]);
    }
    
    private function processWithPaymentProcessor($transaction)
    {
        // Integration with Stripe/Adyen/SSLCommerz
        // Returns payment processor result
        return ['status' => 'success'];
    }
}
