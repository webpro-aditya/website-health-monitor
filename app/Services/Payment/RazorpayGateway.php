<?php

namespace App\Services\Payment;

use App\Contracts\PaymentGatewayInterface;
use Razorpay\Api\Api;
use Exception;

class RazorpayGateway implements PaymentGatewayInterface
{
    protected $api;

    public function __construct()
    {
        $this->api = new Api(env('RAZORPAY_KEY_ID'), env('RAZORPAY_KEY_SECRET'));
    }

    public function createCustomer(array $data): array
    {
        try {
            $customer = $this->api->customer->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'contact' => $data['phone'] ?? null,
            ]);
            return $customer->toArray();
        } catch (Exception $e) {
            throw new Exception("Razorpay createCustomer error: " . $e->getMessage());
        }
    }

    public function createSubscription(string $planId, int $totalCount = 12): array
    {
        try {
            $subscription = $this->api->subscription->create([
                'plan_id' => $planId,
                'customer_notify' => 1,
                'total_count' => $totalCount,
                // Additional attributes can be added based on Razorpay docs
            ]);
            return $subscription->toArray();
        } catch (Exception $e) {
            throw new Exception("Razorpay createSubscription error: " . $e->getMessage());
        }
    }

    public function verifySignature(array $attributes): bool
    {
        try {
            $this->api->utility->verifyPaymentSignature([
                'razorpay_payment_id' => $attributes['razorpay_payment_id'],
                'razorpay_subscription_id' => $attributes['razorpay_subscription_id'],
                'razorpay_signature' => $attributes['razorpay_signature']
            ]);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    public function getSubscription(string $subscriptionId): array
    {
        try {
            $subscription = $this->api->subscription->fetch($subscriptionId);
            return $subscription->toArray();
        } catch (Exception $e) {
            throw new Exception("Razorpay getSubscription error: " . $e->getMessage());
        }
    }

    public function updateSubscription(string $subscriptionId, string $planId): array
    {
        try {
            // Fetch subscription and update the plan_id
            $subscription = $this->api->subscription->fetch($subscriptionId)->update([
                'plan_id' => $planId,
                'customer_notify' => 1
            ]);
            return $subscription->toArray();
        } catch (Exception $e) {
            throw new Exception("Razorpay updateSubscription error: " . $e->getMessage());
        }
    }

    public function cancelSubscription(string $subscriptionId): array
    {
        try {
            $subscription = $this->api->subscription->fetch($subscriptionId)->cancel();
            return $subscription->toArray();
        } catch (Exception $e) {
            throw new Exception("Razorpay cancelSubscription error: " . $e->getMessage());
        }
    }
}
