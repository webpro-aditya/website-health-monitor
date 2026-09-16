<?php

namespace App\Repositories;

use App\Models\Subscription;

class SubscriptionRepository
{
    /**
     * Get the active subscription for a specific user.
     *
     * @param int $userId
     * @return \App\Models\Subscription|null
     */
    public function getActiveSubscriptionForUser($userId)
    {
        return Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Cancel all old active subscriptions for a user except the one with $keepSubscriptionId.
     *
     * @param int $userId
     * @param int $keepSubscriptionId
     * @return int Number of rows updated
     */
    public function cancelOldSubscriptions($userId, $keepSubscriptionId)
    {
        return Subscription::where('user_id', $userId)
            ->where('id', '!=', $keepSubscriptionId)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);
    }

    /**
     * Get subscription count by plan name for active subscriptions of non-admin users.
     *
     * @return \Illuminate\Support\Collection
     */
    public function getSubscriptionCountsByPlan()
    {
        return Subscription::where('status', 'active')
            ->whereHas('user', function($q) {
                $q->where('role', '!=', 'admin');
            })
            ->selectRaw('plan_name, COUNT(*) as count')
            ->groupBy('plan_name')
            ->pluck('count', 'plan_name');
    }
}
