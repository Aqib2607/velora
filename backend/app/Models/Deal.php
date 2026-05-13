<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deal extends Model
{
    use HasTenantScope;

    protected $fillable = [
        'tenant_id',
        'title',
        'type',
        'discount_percentage',
        'starts_at',
        'expires_at',
        'stock_allocation',
        'stock_sold',
        'is_active',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'starts_at'           => 'datetime',
        'expires_at'          => 'datetime',
        'is_active'           => 'boolean',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function hasStock(): bool
    {
        return $this->stock_allocation === 0 || $this->stock_sold < $this->stock_allocation;
    }
}
