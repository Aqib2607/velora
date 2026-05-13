<?php

namespace App\Modules\GiftCard;

use App\Models\GiftCard;
use App\Models\LedgerTransaction;
use App\Models\User;
use App\Modules\Ledger\LedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class GiftCardService
{
    public function __construct(private readonly LedgerService $ledger) {}

    /**
     * Generate a new gift card.
     */
    public function create(int $purchaserId, int $tenantId, float $amount, string $currency = 'USD'): GiftCard
    {
        return GiftCard::create([
            'tenant_id'       => $tenantId,
            'purchaser_id'    => $purchaserId,
            'code'            => 'GC-' . strtoupper(Str::random(12)),
            'initial_balance' => $amount,
            'current_balance' => $amount,
            'currency'        => $currency,
            'status'          => 'active',
            'expires_at'      => now()->addYears(5),
        ]);
    }

    /**
     * Redeem a gift card partially or fully.
     */
    public function redeem(string $code, float $amountToRedeem, int $userId, int $tenantId, string $reference): array
    {
        return DB::transaction(function () use ($code, $amountToRedeem, $userId, $tenantId, $reference) {
            $giftCard = GiftCard::where('code', $code)
                ->where('tenant_id', $tenantId)
                ->lockForUpdate()
                ->firstOrFail();

            if (!$giftCard->isRedeemable()) {
                throw new RuntimeException('Gift card is not valid or expired.');
            }

            if ($giftCard->current_balance < $amountToRedeem) {
                throw new RuntimeException('Insufficient gift card balance.');
            }

            // Deduct balance
            $giftCard->current_balance -= $amountToRedeem;
            
            if ($giftCard->current_balance <= 0) {
                $giftCard->status = 'exhausted';
            }
            
            $giftCard->save();

            // Post ledger entry for gift card liability reduction
            $tx = $this->ledger->post(
                $reference,
                "Gift card redemption: {$code}",
                [
                    ['account_code' => 'GC_LIABILITY', 'type' => 'debit',  'amount' => $amountToRedeem, 'memo' => 'Gift card redeemed'],
                    ['account_code' => 'REVENUE',      'type' => 'credit', 'amount' => $amountToRedeem, 'memo' => 'Revenue recognized'],
                ],
                $tenantId,
                $giftCard->currency,
                1.0 // Gift cards are typically stored in base currency or their own face currency. 
            );

            return ['gift_card' => $giftCard, 'transaction' => $tx];
        });
    }
}
