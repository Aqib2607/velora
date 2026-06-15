<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Modules\Payment\PaymentService;

class CertifyFinancialRuntime extends Command
{
    protected $signature = 'financial:certify';
    protected $description = 'Execute a physical Stripe certification test flow';

    public function handle(PaymentService $paymentService)
    {
        $this->info("Starting Final Runtime Financial Certification...");

        // 1. Ensure we have an order to test with
        $order = Order::first();
        if (!$order) {
            $this->error("No orders found in database to simulate checkout.");
            return 1;
        }

        $this->info("Testing with Order #{$order->order_number} (Total: \${$order->total})");

        // 2. Physical Stripe Execution
        try {
            $this->info("Initiating Physical Stripe API Call (createIntent)...");
            $result = $paymentService->createIntent($order, 1);
            
            $this->info("SUCCESS! PaymentIntent ID: " . $result['id']);
            
            // Refund attempt
            $this->info("Initiating Physical Stripe API Call (refund)...");
            $refund = $paymentService->refund($result['id'], (int)($order->total * 100));
            $this->info("SUCCESS! Refund ID: " . $refund->id);
            
            // Payout attempt
            $this->info("Initiating Physical Stripe API Call (transfer)...");
            $transfer = $paymentService->transfer('acct_123456789', (int)($order->total * 100));
            $this->info("SUCCESS! Transfer ID: " . $transfer->id);

        } catch (\Stripe\Exception\AuthenticationException $e) {
            $this->error("STRIPE AUTHENTICATION FAILURE: " . $e->getMessage());
            $this->error("The API key provided is invalid. Certification blocked due to missing STRIPE_SECRET in .env.");
            return 1;
        } catch (\Stripe\Exception\ApiErrorException $e) {
            $this->error("STRIPE API FAILURE: " . $e->getMessage());
            return 1;
        } catch (\Exception $e) {
            $this->error("SYSTEM FAILURE: " . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
