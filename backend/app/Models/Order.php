<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasTenantScope, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'order_number',
        'idempotency_key',
        'status',
        'subtotal',
        'tax',
        'shipping',
        'discount',
        'total',
        'shipping_address',
        'billing_address',
        'currency_code',
        'exchange_rate_snapshot',
        'region_code',
        'notes',
        'paid_at',
    ];

    protected $casts = [
        'shipping_address'       => 'array',
        'billing_address'        => 'array',
        'paid_at'                => 'datetime',
        'total'                  => 'decimal:2',
        'subtotal'               => 'decimal:2',
        'exchange_rate_snapshot'  => 'decimal:6',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function refunds(): HasMany
    {
        return $this->hasMany(Refund::class);
    }

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'payment_pending']);
    }
}
