<?php

namespace App\Services;

use App\Models\User;
use App\Contracts\PaymentGatewayInterface;
use App\Repositories\SubscriptionRepository;

class SubscriptionService
{
    protected $gateway;
    protected $subscriptionRepo;

    public function __construct(PaymentGatewayInterface $gateway, SubscriptionRepository $subscriptionRepo)
    {
        $this->gateway = $gateway;
        $this->subscriptionRepo = $subscriptionRepo;
    }

    /**
     * Get the formatted subscription details for the UI.
     *
     * @param User $user
     * @return array|null
     */
    public function getFormattedSubscriptionDetails(User $user)
    {
        $activeSubscription = $this->subscriptionRepo->getActiveSubscriptionForUser($user->id);

        if ($activeSubscription) {
            $planData = $this->getPlanDetailsFromRazorpayId($activeSubscription->plan_name);
            try {
                $rzpSub = $this->gateway->getSubscription($activeSubscription->razorpay_subscription_id);
                return [
                    'type' => 'subscription',
                    'plan' => $planData['name'],
                    'price' => $planData['price'],
                    'expiry' => isset($rzpSub['current_end']) ? date('F j, Y, g:i a', $rzpSub['current_end']) : 'Auto-renews',
                    'features' => $this->getFeaturesForPlan($planData['name'])
                ];
            } catch (\Exception $e) {
                // fallback
                return [
                    'type' => 'subscription',
                    'plan' => $planData['name'],
                    'price' => $planData['price'],
                    'expiry' => 'Auto-renews',
                    'features' => $this->getFeaturesForPlan($planData['name'])
                ];
            }
        } elseif ($user->trial_ends_at && $user->trial_ends_at->isFuture()) {
            return [
                'type' => 'trial',
                'plan' => 'Free Trial',
                'price' => 'Free',
                'expiry' => $user->trial_ends_at->format('F j, Y, g:i a'),
                'features' => $this->getFeaturesForPlan('pro')
            ];
        }

        return null;
    }
    
    /**
     * Get basic plan details for the user dashboard.
     * 
     * @param User $user
     * @return array
     */
    public function getBasicPlanDetails(User $user)
    {
        $activeSubscription = $this->subscriptionRepo->getActiveSubscriptionForUser($user->id);
        
        $planDetails = [
            'name' => 'Free Trial',
            'expiry' => $user->trial_ends_at ? $user->trial_ends_at->format('M d, Y') : 'N/A'
        ];

        if ($activeSubscription) {
            $planDetails['name'] = $this->getPlanNameMap()[$activeSubscription->plan_name] ?? 'Custom Plan';
            try {
                $rzpSub = $this->gateway->getSubscription($activeSubscription->razorpay_subscription_id);
                if (isset($rzpSub['current_end'])) {
                    $planDetails['expiry'] = date('M d, Y', $rzpSub['current_end']);
                }
            } catch (\Exception $e) {}
        }
        
        return $planDetails;
    }

    /**
     * Get the mapped name of a plan from its Razorpay ID.
     *
     * @return array
     */
    public function getPlanNameMap()
    {
        return [
            env('RAZORPAY_PLAN_STARTER_MONTHLY') => 'Starter Monthly',
            env('RAZORPAY_PLAN_STARTER_YEARLY') => 'Starter Yearly',
            env('RAZORPAY_PLAN_PRO_MONTHLY') => 'Pro Monthly',
            env('RAZORPAY_PLAN_PRO_YEARLY') => 'Pro Yearly',
            env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') => 'Enterprise Monthly',
            env('RAZORPAY_PLAN_ENTERPRISE_YEARLY') => 'Enterprise Yearly',
        ];
    }

    /**
     * Get plan details including price.
     *
     * @param string $razorpayPlanId
     * @return array
     */
    public function getPlanDetailsFromRazorpayId($razorpayPlanId)
    {
        $sym = env('CURRENCY_SYMBOL', '$');
        $plans = [
            env('RAZORPAY_PLAN_STARTER_MONTHLY') => ['name' => 'Starter Monthly', 'price' => $sym . '9/mo'],
            env('RAZORPAY_PLAN_STARTER_YEARLY') => ['name' => 'Starter Yearly', 'price' => $sym . '7/mo (Billed Annually)'],
            env('RAZORPAY_PLAN_PRO_MONTHLY') => ['name' => 'Pro Monthly', 'price' => $sym . '29/mo'],
            env('RAZORPAY_PLAN_PRO_YEARLY') => ['name' => 'Pro Yearly', 'price' => $sym . '23/mo (Billed Annually)'],
            env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') => ['name' => 'Enterprise Monthly', 'price' => $sym . '79/mo'],
            env('RAZORPAY_PLAN_ENTERPRISE_YEARLY') => ['name' => 'Enterprise Yearly', 'price' => $sym . '63/mo (Billed Annually)'],
        ];

        return $plans[$razorpayPlanId] ?? ['name' => 'Custom Plan', 'price' => ''];
    }

    /**
     * Get the features array for a specific plan name.
     *
     * @param string $plan
     * @return array
     */
    public function getFeaturesForPlan($plan)
    {
        $plan = strtolower($plan);
        if (str_contains($plan, 'starter')) {
            return [
                '10 Websites',
                '5-minute check interval',
                'Email alerts',
                '30-day log retention'
            ];
        } elseif (str_contains($plan, 'enterprise')) {
            return [
                'Unlimited websites',
                '30-second check interval',
                'All notification channels',
                'Priority support',
                '1-year log retention',
                'Custom integrations'
            ];
        }
        
        // Default to Pro
        return [
            '50 Websites',
            '1-minute check interval',
            'Email + SMS + Slack',
            'SSL monitoring',
            '90-day log retention',
            'API access'
        ];
    }
}
