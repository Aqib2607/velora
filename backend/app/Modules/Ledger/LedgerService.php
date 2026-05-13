<?php

namespace App\Modules\Ledger;

use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\LedgerTransaction;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class LedgerService
{
    /**
     * Post a balanced double-entry transaction.
     * Entries must have equal debit and credit totals.
     *
     * Currency is passed through from the calling context (order, refund, etc.)
     * and stored immutably on each entry. The ledger itself remains balanced
     * in whatever currency the transaction specifies — cross-currency netting
     * is handled at the reporting layer.
     *
     * @param  array{account_code: string, type: string, amount: float, memo?: string}[]  $entries
     */
    public function post(string $reference, string $description, array $entries, int $tenantId, string $currency = 'USD', float $exchangeRate = 1.0): LedgerTransaction
    {
        return DB::transaction(function () use ($reference, $description, $entries, $tenantId, $currency, $exchangeRate) {
            // Validate balance before writing
            $debits  = array_sum(array_column(array_filter($entries, fn($e) => $e['type'] === 'debit'), 'amount'));
            $credits = array_sum(array_column(array_filter($entries, fn($e) => $e['type'] === 'credit'), 'amount'));

            if (round($debits, 2) !== round($credits, 2)) {
                throw new RuntimeException("Ledger transaction is unbalanced: debits={$debits}, credits={$credits}");
            }

            $transaction = LedgerTransaction::create([
                'tenant_id'   => $tenantId,
                'reference'   => $reference,
                'description' => $description,
                'status'      => 'posted',
                'posted_at'   => now(),
            ]);

            foreach ($entries as $entry) {
                $account = LedgerAccount::where('code', $entry['account_code'])
                    ->where('tenant_id', $tenantId)
                    ->lockForUpdate()
                    ->firstOrFail();

                LedgerEntry::create([
                    'tenant_id'      => $tenantId,
                    'transaction_id' => $transaction->id,
                    'account_id'     => $account->id,
                    'type'           => $entry['type'],
                    'amount'         => $entry['amount'],
                    'currency'       => $currency,
                    'exchange_rate'  => $exchangeRate,
                    'memo'           => $entry['memo'] ?? null,
                ]);

                // Update account running balance with pessimistic lock
                $isNaturalDebit = in_array($account->type, ['asset', 'expense']);

                if ($isNaturalDebit) {
                    $account->balance += ($entry['type'] === 'debit' ? $entry['amount'] : -$entry['amount']);
                } else {
                    $account->balance += ($entry['type'] === 'credit' ? $entry['amount'] : -$entry['amount']);
                }

                $account->save();
            }

            return $transaction;
        });
    }

    /**
     * Create compensating (reversal) entries for a given transaction.
     * Preserves the original currency and exchange rate for audit integrity.
     */
    public function reverse(LedgerTransaction $original, string $reason): LedgerTransaction
    {
        $original->loadMissing('entries.account');

        // Extract currency from original entries (all entries in a transaction share the same currency)
        $originalCurrency     = $original->entries->first()?->currency ?? 'USD';
        $originalExchangeRate = $original->entries->first()?->exchange_rate ?? 1.0;

        $entries = [];
        foreach ($original->entries as $entry) {
            $entries[] = [
                'account_code' => $entry->account->code,
                'type'         => $entry->type === 'debit' ? 'credit' : 'debit',
                'amount'       => $entry->amount,
                'memo'         => "Reversal of entry #{$entry->id}: {$reason}",
            ];
        }

        $reversed = $this->post(
            "reversal_of_{$original->reference}",
            "Reversal: {$original->description} — {$reason}",
            $entries,
            $original->tenant_id,
            $originalCurrency,
            $originalExchangeRate
        );

        $original->update(['status' => 'reversed']);

        return $reversed;
    }
}
