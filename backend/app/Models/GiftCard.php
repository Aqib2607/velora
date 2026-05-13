<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GiftCard extends Model
{
    use HasTenantScope;

    protected $fillable = [
        'tenant_id',
        'purchaser_id',
        'code',
        'initial_balance',
        'current_balance',
        'currency',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
        'expires_at'      => 'datetime',
    ];

    public function purchaser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purchaser_id');
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isRedeemable(): bool
    {
        return $this->status === 'active'
            && $this->current_balance > 0
            && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
