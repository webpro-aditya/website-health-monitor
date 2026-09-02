<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MonitoringLog extends Model
{
    protected $guarded = [];

    protected $casts = [
        'is_up' => 'boolean',
        'checked_at' => 'datetime',
    ];

    public function domainUrl()
    {
        return $this->belongsTo(DomainUrl::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
