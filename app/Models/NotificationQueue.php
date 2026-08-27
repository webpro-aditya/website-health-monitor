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
    ];
}
