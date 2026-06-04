<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchAnalytics extends Model
{
    protected $fillable = [
        'tenant_id',
        'query',
        'result_count',
        'clicked_product_id',
        'clicked_at',
        'session_id',
        'user_id',
        'searched_at',
    ];

    protected $casts = [
        'searched_at' => 'datetime',
        'clicked_at' => 'datetime',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class)->nullable();
    }
}
