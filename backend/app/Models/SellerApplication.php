<?php

namespace App\Models;

use App\Models\Traits\HasTenantScope;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerApplication extends Model
{
    use HasTenantScope;

    protected $fillable = [
        'tenant_id',
        'user_id',
        'business_name',
        'business_email',
        'phone',
        'country_code',
        'tax_id',
        'status',
        'rejection_reason',
        'kyc_documents',
    ];

    protected $casts = [
        'kyc_documents' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function isPending(): bool
    {
        return in_array($this->status, ['pending', 'reviewing']);
    }
}
