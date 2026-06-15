<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = ['code', 'type', 'value', 'min_order_value', 'max_uses', 'uses', 'is_active', 'expires_at', 'tenant_id'];

    protected $casts = [
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'value' => 'decimal:2',
        'min_order_value' => 'decimal:2',
    ];

    public function isValid($orderValue = 0)
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses && $this->uses >= $this->max_uses) return false;
        if ($orderValue < $this->min_order_value) return false;
        return true;
    }
}
