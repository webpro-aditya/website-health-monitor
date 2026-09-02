<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationQueue extends Model
{
    protected $fillable = [
        'user_id',
        'domain_url_id',
        'type',
        'status',
        'message',
        'error_log',
        'event_type',
        'recipient',
        'retry_count',
        'sent_at',
        'provider_response'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function domainUrl()
    {
        return $this->belongsTo(DomainUrl::class);
    }
}
