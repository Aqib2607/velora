<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Inventory extends Model
{
    use HasTenantScope;

    protected $table = 'inventory';

    protected $fillable = [
        'tenant_id',
        'sku_id',
        'quantity_available',
        'quantity_reserved',
        'quantity_sold',
        'low_stock_threshold',
    ];

    protected $casts = [
        'quantity_available' => 'integer',
        'quantity_reserved'  => 'integer',
        'quantity_sold'      => 'integer',
    ];

    public function sku(): BelongsTo
    {
        return $this->belongsTo(Sku::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(InventoryReservation::class, 'sku_id', 'sku_id');
    }

    public function isInStock(int $qty = 1): bool
    {
        return $this->quantity_available >= $qty;
    }
}
