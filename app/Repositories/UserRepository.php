<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository
{
    /**
     * Get all users excluding admins, with their domains count and active subscriptions.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUsersWithActiveSubscriptionsAndDomainCounts()
    {
        return User::where('role', '!=', 'admin')
            ->withCount('domains')
            ->with(['subscriptions' => function($q) {
                $q->where('status', 'active');
            }])
            ->get();
    }

    /**
     * Get the total count of non-admin registered users.
     *
     * @return int
     */
    public function getRegisteredUsersCount()
    {
        return User::where('role', '!=', 'admin')->count();
    }

    /**
     * Get the count of non-admin users created before a specific date.
     *
     * @param \Carbon\Carbon $date
     * @return int
     */
    public function getCountBeforeDate($date)
    {
        return User::where('created_at', '<', $date)->count();
    }

    /**
     * Get user growth data between dates grouped by day.
     *
     * @param \Carbon\Carbon $startDate
     * @param \Carbon\Carbon $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserGrowthByDay($startDate, $endDate)
    {
        return User::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get user growth data between dates grouped by month.
     *
     * @param \Carbon\Carbon $startDate
     * @param \Carbon\Carbon $endDate
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getUserGrowthByMonth($startDate, $endDate)
    {
        return User::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->get();
    }
}
