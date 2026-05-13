<?php

namespace App\Modules\Ecosystem;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class WalletService
{
    /**
     * Get real-time wallet balance for the ecosystem user.
     */
    public function getBalance(int $userId): float
    {
        return (float) DB::table('wallet_ledgers')
            ->where('user_id', $userId)
            ->sum('amount');
    }

    /**
     * Process a closed-loop wallet transaction securely within the ecosystem.
     */
    public function processTransaction(int $userId, float $amount, string $currency, string $description, string $referenceId): void
    {
        DB::transaction(function () use ($userId, $amount, $currency, $description, $referenceId) {
            // Pessimistic lock on the user's wallet summary to prevent race conditions
            $currentBalance = DB::table('wallet_ledgers')
                ->where('user_id', $userId)
                ->lockForUpdate()
                ->sum('amount');

            if ($amount < 0 && $currentBalance < abs($amount)) {
                throw new \Exception('Insufficient wallet balance.');
            }

            // Insert immutable ledger entry
            DB::table('wallet_ledgers')->insert([
                'user_id' => $userId,
                'amount' => $amount,
                'currency' => $currency,
                'description' => $description,
                'reference_id' => $referenceId,
                'created_at' => now(),
            ]);

            // Track for FinOps
            event(new \App\Events\EcosystemWalletTransactionCompleted($userId, $amount, $currency));
        });
    }
}
