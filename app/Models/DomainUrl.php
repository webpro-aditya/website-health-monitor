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

    public function getIntervalForSubscription(): int
    {
        $interval = 900; // default 15min
        $user = $this->user;
        if ($user) {
            // Because we eager load this in the scheduler, use first() on the collection if loaded
            $sub = $user->relationLoaded('subscriptions') 
                ? $user->subscriptions->firstWhere('status', 'active')
                : $user->subscriptions()->where('status', 'active')->first();
                
            if ($sub) {
                $planId = $sub->plan_name; // This holds the Razorpay plan_id
                
                if ($planId === env('RAZORPAY_PLAN_STARTER_MONTHLY') || $planId === env('RAZORPAY_PLAN_STARTER_YEARLY')) {
                    $interval = 300; // 5min
                } elseif ($planId === env('RAZORPAY_PLAN_PRO_MONTHLY') || $planId === env('RAZORPAY_PLAN_PRO_YEARLY')) {
                    $interval = 60; // 1min
                } elseif ($planId === env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') || $planId === env('RAZORPAY_PLAN_ENTERPRISE_YEARLY')) {
                    $interval = 30; // 30s
                }
            }
        }
        return $interval;
    }
}
