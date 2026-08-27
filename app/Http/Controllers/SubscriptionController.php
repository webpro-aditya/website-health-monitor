<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Contracts\PaymentGatewayInterface;

class SubscriptionController extends Controller
{
    public function index(Request $request, PaymentGatewayInterface $gateway)
    {
        $user = $request->user();
        
        // Fetch Subscription details
        $subscriptionDetails = null;
        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();
        
        if ($activeSubscription) {
            $planData = $this->getPlanDetailsFromRazorpayId($activeSubscription->plan_name);
            try {
                $rzpSub = $gateway->getSubscription($activeSubscription->razorpay_subscription_id);
                $subscriptionDetails = [
                    'type' => 'subscription',
                    'plan' => $planData['name'],
                    'price' => $planData['price'],
                    'expiry' => isset($rzpSub['current_end']) ? date('F j, Y, g:i a', $rzpSub['current_end']) : 'Auto-renews',
                    'features' => $this->getFeaturesForPlan($planData['name'])
                ];
            } catch (\Exception $e) {
                // fallback
                $subscriptionDetails = [
                    'type' => 'subscription',
                    'plan' => $planData['name'],
                    'price' => $planData['price'],
                    'expiry' => 'Auto-renews',
                    'features' => $this->getFeaturesForPlan($planData['name'])
                ];
            }
        } elseif ($user->trial_ends_at && $user->trial_ends_at->isFuture()) {
            $subscriptionDetails = [
                'type' => 'trial',
                'plan' => 'Pro (Trial)',
                'price' => 'Free',
                'expiry' => $user->trial_ends_at->format('F j, Y, g:i a'),
                'features' => $this->getFeaturesForPlan('pro')
            ];
        }

        return Inertia::render('Subscription/Index', [
            'subscriptionDetails' => $subscriptionDetails
        ]);
    }

    private function getPlanDetailsFromRazorpayId($razorpayPlanId)
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

    private function getFeaturesForPlan($plan)
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
