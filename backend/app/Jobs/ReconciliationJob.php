<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Stripe\StripeClient;

class ReconciliationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info('ReconciliationJob: Starting daily ledger reconciliation against Stripe balances.');
        
        $stripe = new StripeClient(config('services.stripe.secret'));
        
        try {
            $balance = $stripe->balance->retrieve();
            Log::info('Stripe Balance Retrieved', ['available' => $balance->available]);
            
            // Calculate system ledger total for all CASH accounts
            $ledgerTotal = \Illuminate\Support\Facades\DB::table('ledger_entries')
                ->join('ledger_accounts', 'ledger_entries.account_id', '=', 'ledger_accounts.id')
                ->where('ledger_accounts.code', 'CASH')
                ->select(\Illuminate\Support\Facades\DB::raw('SUM(CASE WHEN type = "debit" THEN amount ELSE -amount END) as total'))
                ->value('total') ?? 0.0;

            $stripeAvailable = 0.0;
            foreach ($balance->available as $b) {
                if ($b->currency === 'usd') {
                    $stripeAvailable += $b->amount / 100;
                }
            }

            $mismatch = abs($stripeAvailable - (float) $ledgerTotal);

            if ($mismatch > 0.01) {
                Log::critical('ReconciliationJob: Ledger consistency failed. Mismatch detected.', [
                    'stripe_balance' => $stripeAvailable,
                    'ledger_balance' => $ledgerTotal,
                    'mismatch_amount' => $mismatch
                ]);
                // In production, this would trigger PagerDuty or alert operations
            } else {
                Log::info('ReconciliationJob: Ledger consistency verified.', [
                    'stripe_balance' => $stripeAvailable,
                    'ledger_balance' => $ledgerTotal
                ]);
            }
        } catch (\Exception $e) {
            Log::error('ReconciliationJob: Failed to retrieve Stripe balance.', ['error' => $e->getMessage()]);
            throw $e;
        }
    }
}
