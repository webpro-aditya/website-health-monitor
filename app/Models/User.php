<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
        'advanced_settings',
        'notification_emails',
        'trial_ends_at',
        'activity_logging_enabled',
    ];

    public function domains()
    {
        return $this->hasMany(DomainUrl::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'advanced_settings' => 'array',
            'notification_emails' => 'array',
            'trial_ends_at' => 'datetime',
            'activity_logging_enabled' => 'boolean',
        ];
    }

    public function getMaxDomainsLimit(): int
    {
        $limit = 2; // Default for trial/no active plan
        $sub = $this->relationLoaded('subscriptions') 
            ? $this->subscriptions->firstWhere('status', 'active')
            : $this->subscriptions()->where('status', 'active')->first();
            
        if ($sub) {
            $planId = $sub->plan_name; // This holds the Razorpay plan_id

            if ($planId === env('RAZORPAY_PLAN_PRO_MONTHLY') || $planId === env('RAZORPAY_PLAN_PRO_YEARLY')) {
                $limit = 15;
            } elseif ($planId === env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') || $planId === env('RAZORPAY_PLAN_ENTERPRISE_YEARLY')) {
                $limit = 50;
            }
        }
        
        return $limit;
    }
}
