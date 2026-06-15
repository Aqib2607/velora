<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VariantInventory extends Model
{
    use HasTenantScope;

    protected $table = 'inventory';

    protected $fillable = [
        'tenant_id',
        'sku_id',
        'quantity',
        'reserved_quantity',
        'low_stock_threshold',
    ];

    public function sku(): BelongsTo
    {
        return $this->belongsTo(Sku::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'sku_id', 'sku_id');
    }
}
