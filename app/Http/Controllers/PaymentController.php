<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Contracts\PaymentGatewayInterface;
use App\Models\Subscription;

class PaymentController extends Controller
{
    protected $gateway;

    public function __construct(PaymentGatewayInterface $gateway)
    {
        $this->gateway = $gateway;
    }

    public function checkout(Request $request, PaymentGatewayInterface $gateway)
    {
        $user = $request->user();
        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();
        
        $currentPlan = null;
        $expiryDate = null;
        
        if ($activeSubscription) {
            $currentPlan = $activeSubscription->plan_name;
            try {
                $rzpSub = $gateway->getSubscription($activeSubscription->razorpay_subscription_id);
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

        return Inertia::render('Payment/Checkout', [
            'trialDays' => (int) env('TRIAL_DAYS', 3),
            'razorpayKey' => env('RAZORPAY_KEY_ID'),
            'plans' => [
                'starter_monthly' => env('RAZORPAY_PLAN_STARTER_MONTHLY'),
                'starter_yearly' => env('RAZORPAY_PLAN_STARTER_YEARLY'),
                'pro_monthly' => env('RAZORPAY_PLAN_PRO_MONTHLY'),
                'pro_yearly' => env('RAZORPAY_PLAN_PRO_YEARLY'),
                'enterprise_monthly' => env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY'),
                'enterprise_yearly' => env('RAZORPAY_PLAN_ENTERPRISE_YEARLY'),
            ],
            'selectedPlan' => $request->query('plan', 'pro_monthly'),
            'currentSubscription' => [
                'plan' => $currentPlan,
                'expiry' => $expiryDate
            ]
        ]);
    }

    public function skipPayment(Request $request)
    {
        $user = $request->user();
        $user->trial_ends_at = now()->addDays((int) env('TRIAL_DAYS', 3));
        $user->save();

        return redirect()->route('dashboard');
    }

    public function createSubscription(Request $request)
    {
        $request->validate([
            'plan_id' => 'required|string'
        ]);

        $user = $request->user();
        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();

        try {
            if ($activeSubscription) {
                try {
                    // Update existing subscription
                    $updatedSub = $this->gateway->updateSubscription(
                        $activeSubscription->razorpay_subscription_id, 
                        $request->plan_id
                    );
                    
                    // Update our DB record
                    $activeSubscription->plan_name = $request->plan_id;
                    $activeSubscription->save();

                    return response()->json([
                        'subscription_id' => $updatedSub['id'],
                        'status' => 'updated'
                    ]);
                } catch (\Exception $updateException) {
                    \Log::warning('Razorpay update failed, falling back to new subscription: ' . $updateException->getMessage());
                    // Fall back to creating a new subscription below
                }
            }

            // Create new subscription (for new user, or if update failed due to Razorpay constraints like UPI)
            $subscription = $this->gateway->createSubscription($request->plan_id);
            
            Subscription::create([
                'user_id' => $user->id,
                'razorpay_subscription_id' => $subscription['id'],
                'plan_name' => $request->plan_id,
                'status' => 'created'
            ]);

            return response()->json([
                'subscription_id' => $subscription['id']
            ]);
        } catch (\Exception $e) {
            \Log::error('Payment Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function verifyPayment(Request $request)
    {
        $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_subscription_id' => 'required|string',
            'razorpay_signature' => 'required|string',
        ]);

        $isValid = $this->gateway->verifySignature($request->only([
            'razorpay_payment_id',
            'razorpay_subscription_id',
            'razorpay_signature'
        ]));

        if ($isValid) {
            $subscription = Subscription::where('razorpay_subscription_id', $request->razorpay_subscription_id)->first();
            if ($subscription) {
                // Cancel any old active subscriptions for this user to avoid duplicate plans
                Subscription::where('user_id', $subscription->user_id)
                    ->where('id', '!=', $subscription->id)
                    ->where('status', 'active')
                    ->update(['status' => 'cancelled']);

                $subscription->status = 'active';
                $subscription->save();
            }
            return redirect()->route('dashboard');
        }

        return redirect()->route('payment.checkout');
    }
}
