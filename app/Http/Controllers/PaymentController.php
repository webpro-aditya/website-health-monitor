<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\CheckoutRequest;
use App\Http\Requests\VerifyPaymentRequest;
use Inertia\Inertia;
use App\Contracts\PaymentGatewayInterface;
use App\Models\Subscription;
use App\Services\ActivityLogger;

class PaymentController extends Controller
{
    protected $gateway;

    public function __construct(PaymentGatewayInterface $gateway)
    {
        $this->gateway = $gateway;
    }

    public function checkout(Request $request, \App\Services\PaymentService $paymentService)
    {
        if ($request->query('plan') === 'free_trial') {
            return $this->skipPayment($request, $paymentService);
        }

        $user = $request->user();
        $requestedPlan = $request->query('plan', 'pro_monthly');
        
        $checkoutData = $paymentService->getCheckoutData($user, $requestedPlan);

        return Inertia::render('Payment/Checkout', $checkoutData);
    }

    public function skipPayment(Request $request, \App\Services\PaymentService $paymentService)
    {
        $user = $request->user();
        $paymentService->startFreeTrial($user);

        return redirect()->route('dashboard');
    }

    public function createSubscription(CheckoutRequest $request, \App\Services\PaymentService $paymentService)
    {
        $user = $request->user();

        try {
            $result = $paymentService->createOrUpdateSubscription($user, $request->plan_id);
            return response()->json($result);
        } catch (\Exception $e) {
            \Log::error('Payment Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function verifyPayment(VerifyPaymentRequest $request, \App\Services\PaymentService $paymentService)
    {
        $success = $paymentService->verifyAndActivateSubscription($request->only([
            'razorpay_payment_id',
            'razorpay_subscription_id',
            'razorpay_signature'
        ]));

        if ($success) {
            return redirect()->route('dashboard');
        }

        return redirect()->route('payment.checkout');
    }
}
