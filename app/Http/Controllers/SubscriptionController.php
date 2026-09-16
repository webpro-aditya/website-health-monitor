<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Contracts\PaymentGatewayInterface;

class SubscriptionController extends Controller
{
    public function index(Request $request, \App\Services\SubscriptionService $subscriptionService)
    {
        $user = $request->user();
        
        $subscriptionDetails = $subscriptionService->getFormattedSubscriptionDetails($user);
        
        // Determine currentPlanId 
        // This logic is mostly for the UI to highlight the active plan
        $currentPlanId = 'trial';
        if ($subscriptionDetails && $subscriptionDetails['type'] === 'subscription') {
            $planMap = array_flip($subscriptionService->getPlanNameMap());
            if (isset($planMap[$subscriptionDetails['plan']])) {
                $currentPlanId = $planMap[$subscriptionDetails['plan']];
            }
        }

        return Inertia::render('Subscription/Index', [
            'subscriptionDetails' => $subscriptionDetails,
            'razorpayKey' => env('RAZORPAY_KEY_ID'),
            'plans' => [
                'starter_monthly' => env('RAZORPAY_PLAN_STARTER_MONTHLY'),
                'starter_yearly' => env('RAZORPAY_PLAN_STARTER_YEARLY'),
                'pro_monthly' => env('RAZORPAY_PLAN_PRO_MONTHLY'),
                'pro_yearly' => env('RAZORPAY_PLAN_PRO_YEARLY'),
                'enterprise_monthly' => env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY'),
                'enterprise_yearly' => env('RAZORPAY_PLAN_ENTERPRISE_YEARLY'),
            ],
            'currentPlanId' => $currentPlanId
        ]);
    }
}
