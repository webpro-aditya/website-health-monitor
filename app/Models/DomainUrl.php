<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DomainUrl extends Model
{
    public $timestamps = false;
    protected $guarded = [];

    protected $casts = [
        'next_check_at' => 'datetime',
        'last_status_change_at' => 'datetime',
        'down_since' => 'datetime',
        'last_notified_at' => 'datetime',
        'last_checked' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function monitoringLogs()
    {
        return $this->hasMany(MonitoringLog::class);
    }

    public function scopeDueForCheck($query)
    {
        return $query->where('status', 'enabled')->where('next_check_at', '<=', now());
    }

    public function scheduleNextCheck()
    {
        $this->next_check_at = now()->addSeconds($this->check_interval);
    }
}
