<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handle(Request $request)
    {
        $payload = $request->all();
        
        // Ensure event exists
        if (!isset($payload['event'])) {
            return response()->json(['status' => 'ignored']);
        }

        $event = $payload['event'];
        $entity = $payload['payload']['subscription']['entity'] ?? null;

        if (!$entity) {
            return response()->json(['status' => 'ignored']);
        }

        $subscriptionId = $entity['id'];

        Log::info("Razorpay Webhook Received: {$event} for Subscription ID: {$subscriptionId}");

        if (in_array($event, ['subscription.halted', 'subscription.cancelled', 'subscription.completed'])) {
            $subscription = Subscription::where('razorpay_subscription_id', $subscriptionId)->first();
            if ($subscription) {
                $subscription->status = 'halted';
                $subscription->save();
                
                // Optional: Dispatch email job here to notify the user
            }
        } elseif ($event === 'subscription.charged' || $event === 'subscription.authenticated') {
            $subscription = Subscription::where('razorpay_subscription_id', $subscriptionId)->first();
            if ($subscription) {
                $subscription->status = 'active';
                $subscription->save();
            }
        }

        return response()->json(['status' => 'ok']);
    }
}
