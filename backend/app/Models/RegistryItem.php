<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistryItem extends Model
{
    use HasTenantScope;

    protected $fillable = [
        'tenant_id',
        'registry_id',
        'product_id',
        'quantity_desired',
        'quantity_purchased',
        'priority',
        'notes',
    ];

    protected $casts = [
        'quantity_desired'   => 'integer',
        'quantity_purchased' => 'integer',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(Registry::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
