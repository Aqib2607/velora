<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    use HasTenantScope;

    protected $fillable = [
        'tenant_id',
        'transaction_id',
        'account_id',
        'type',
        'amount',
        'currency',
        'exchange_rate',
        'memo',
    ];

    protected $casts = ['amount' => 'decimal:2'];

    /**
     * Immutable — prevent any updates via model. DB trigger enforces at DB level.
     */
    public function update(array $attributes = [], array $options = []): never
    {
        throw new \RuntimeException('Ledger entries are immutable and cannot be updated.');
    }

    public function delete(): never
    {
        throw new \RuntimeException('Ledger entries are immutable and cannot be deleted.');
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(LedgerTransaction::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(LedgerAccount::class);
    }
}
