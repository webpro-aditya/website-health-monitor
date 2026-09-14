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
    ];

    public function domains()
    {
        return $this->hasMany(DomainUrl::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
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

            if ($planId === env('RAZORPAY_PLAN_STARTER_MONTHLY') || $planId === env('RAZORPAY_PLAN_STARTER_YEARLY')) {
                $limit = 5;
            } elseif ($planId === env('RAZORPAY_PLAN_PRO_MONTHLY') || $planId === env('RAZORPAY_PLAN_PRO_YEARLY')) {
                $limit = 25;
            } elseif ($planId === env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') || $planId === env('RAZORPAY_PLAN_ENTERPRISE_YEARLY')) {
                $limit = PHP_INT_MAX;
            }
        }
        
        return $limit;
    }
}
