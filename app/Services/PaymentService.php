<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Contracts\PaymentGatewayInterface;
use App\Repositories\SubscriptionRepository;
use App\Services\ActivityLogger;

class PaymentService
{
    protected $gateway;
    protected $subscriptionRepo;

    public function __construct(PaymentGatewayInterface $gateway, SubscriptionRepository $subscriptionRepo)
    {
        $this->gateway = $gateway;
        $this->subscriptionRepo = $subscriptionRepo;
    }

    /**
     * Get the data required for the Checkout page.
     *
     * @param User $user
     * @param string $requestedPlan
     * @return array
     */
    public function getCheckoutData(User $user, $requestedPlan)
    {
        $activeSubscription = $this->subscriptionRepo->getActiveSubscriptionForUser($user->id);
        
        $currentPlan = null;
        $expiryDate = null;
        
        if ($activeSubscription) {
            $currentPlan = $activeSubscription->plan_name;
            try {
                $rzpSub = $this->gateway->getSubscription($activeSubscription->razorpay_subscription_id);
                if (isset($rzpSub['current_end'])) {
                    $expiryDate = date('Y-m-d\TH:i:s.000\Z', $rzpSub['current_end']);
                }
            } catch (\Exception $e) {
                // ignore
            }
        } elseif ($user->trial_ends_at && $user->trial_ends_at->isFuture()) {
            $currentPlan = 'trial';
            $expiryDate = $user->trial_ends_at->toISOString();
        }

        return [
            'trialDays' => (int) config('app.trial_days', 14),
            'razorpayKey' => env('RAZORPAY_KEY_ID'),
            'plans' => [
                'starter_monthly' => env('RAZORPAY_PLAN_STARTER_MONTHLY'),
                'starter_yearly' => env('RAZORPAY_PLAN_STARTER_YEARLY'),
                'pro_monthly' => env('RAZORPAY_PLAN_PRO_MONTHLY'),
                'pro_yearly' => env('RAZORPAY_PLAN_PRO_YEARLY'),
                'enterprise_monthly' => env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY'),
                'enterprise_yearly' => env('RAZORPAY_PLAN_ENTERPRISE_YEARLY'),
            ],
            'selectedPlan' => $requestedPlan,
            'currentSubscription' => [
                'plan' => $currentPlan,
                'expiry' => $expiryDate
            ]
        ];
    }

    /**
     * Start a free trial for a user.
     *
     * @param User $user
     * @return void
     */
    public function startFreeTrial(User $user)
    {
        $user->trial_ends_at = now()->addDays((int) config('app.trial_days', 14));
        $user->save();

        ActivityLogger::log($user, 'started_trial', 'Started 14-day free trial');
    }

    /**
     * Create or update a subscription for a user.
     *
     * @param User $user
     * @param string $planId
     * @return array
     * @throws \Exception
     */
    public function createOrUpdateSubscription(User $user, $planId)
    {
        $activeSubscription = $this->subscriptionRepo->getActiveSubscriptionForUser($user->id);

        if ($activeSubscription) {
            try {
                // Try updating existing subscription first
                $updatedSub = $this->gateway->updateSubscription(
                    $activeSubscription->razorpay_subscription_id, 
                    $planId
                );
                
                // Update our DB record
                $activeSubscription->plan_name = $planId;
                $activeSubscription->save();

                ActivityLogger::log($user, 'changed_plan', "Changed subscription plan to: {$planId}");

                return [
                    'subscription_id' => $updatedSub['id'],
                    'status' => 'updated'
                ];
            } catch (\Exception $updateException) {
                \Log::warning('Razorpay update failed, falling back to new subscription: ' . $updateException->getMessage());
                // Fall back to creating a new subscription below
            }
        }

        // Create new subscription
        $subscription = $this->gateway->createSubscription($planId);
        
        Subscription::create([
            'user_id' => $user->id,
            'razorpay_subscription_id' => $subscription['id'],
            'plan_name' => $planId,
            'status' => 'created'
        ]);

        return [
            'subscription_id' => $subscription['id'],
            'status' => 'created'
        ];
    }

    /**
     * Verify payment signature and activate subscription.
     *
     * @param array $paymentData
     * @return bool
     */
    public function verifyAndActivateSubscription($paymentData)
    {
        $isValid = $this->gateway->verifySignature($paymentData);

        if ($isValid) {
            $subscription = Subscription::where('razorpay_subscription_id', $paymentData['razorpay_subscription_id'])->first();
            if ($subscription) {
                // Cancel any old active subscriptions
                $this->subscriptionRepo->cancelOldSubscriptions($subscription->user_id, $subscription->id);

                $subscription->status = 'active';
                $subscription->save();

                ActivityLogger::log($subscription->user, 'subscription_activated', "Activated subscription plan: {$subscription->plan_name}");
            }
            return true;
        }

        return false;
    }
}
