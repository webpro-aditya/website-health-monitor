<?php

namespace App\Services;

use App\Repositories\UserRepository;
use App\Models\MonitoringLog;
use App\Models\NotificationQueue;
use App\Models\DomainUrl;
use App\Repositories\SubscriptionRepository;
use Carbon\Carbon;

class AdminAnalyticsService
{
    protected $userRepo;
    protected $subscriptionRepo;

    public function __construct(UserRepository $userRepo, SubscriptionRepository $subscriptionRepo)
    {
        $this->userRepo = $userRepo;
        $this->subscriptionRepo = $subscriptionRepo;
    }

    /**
     * Get all analytics data for the admin dashboard.
     *
     * @param string $period
     * @param string|null $customStart
     * @param string|null $customEnd
     * @return array
     */
    public function getDashboardAnalytics($period = '24h', $customStart = null, $customEnd = null)
    {
        list($startDate, $endDate) = $this->getDateRange($period, $customStart, $customEnd);
        
        $diffInDays = $startDate->diffInDays($endDate);
        $diffInHours = $startDate->diffInHours($endDate);

        return [
            'uptimeRate' => $this->getUptimeRate($startDate, $endDate),
            'alertsSent' => $this->getAlertsSent($startDate, $endDate),
            'userGrowth' => $this->getUserGrowth($startDate, $endDate, $diffInDays),
            'hourlyData' => $this->getHourlyData($startDate, $endDate, $diffInHours),
            'domainStatus' => $this->getDomainStatusDistribution(),
            'subscriptionCounts' => $this->subscriptionRepo->getSubscriptionCountsByPlan(),
            'notificationStats' => $this->getNotificationStats($startDate, $endDate),
        ];
    }

    protected function getDateRange($period, $customStart, $customEnd)
    {
        if ($period === 'custom' && $customStart && $customEnd) {
            $startDate = Carbon::parse($customStart)->startOfDay();
            $endDate = Carbon::parse($customEnd)->endOfDay();
        } else {
            $endDate = now();
            switch ($period) {
                case 'today':
                    $startDate = now()->startOfDay();
                    break;
                case '7d':
                    $startDate = now()->subDays(7)->startOfDay();
                    break;
                case '30d':
                    $startDate = now()->subDays(30)->startOfDay();
                    break;
                case '1y':
                    $startDate = now()->subYear()->startOfDay();
                    break;
                case '24h':
                default:
                    $startDate = now()->subHours(24);
                    break;
            }
        }
        return [$startDate, $endDate];
    }

    protected function getUptimeRate($startDate, $endDate)
    {
        return (float) (MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
            ->selectRaw('ROUND(AVG(is_up) * 100, 2) as rate')
            ->value('rate') ?? 0);
    }

    protected function getAlertsSent($startDate, $endDate)
    {
        return NotificationQueue::where('status', 'sent')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
    }

    protected function getUserGrowth($startDate, $endDate, $diffInDays)
    {
        $userGrowth = [];
        $runningTotal = $this->userRepo->getCountBeforeDate($startDate);

        if ($diffInDays <= 31) {
            $userGrowthRaw = $this->userRepo->getUserGrowthByDay($startDate, $endDate);
            $currentDate = clone $startDate;
            $currentDate->startOfDay();
            while ($currentDate <= $endDate) {
                $dateStr = $currentDate->format('Y-m-d');
                $dayData = $userGrowthRaw->firstWhere('date', $dateStr);
                $runningTotal += $dayData ? $dayData->count : 0;
                $userGrowth[] = [
                    'date' => $currentDate->format('M d'),
                    'count' => $runningTotal
                ];
                $currentDate->addDay();
            }
        } else {
             $userGrowthRawMonth = $this->userRepo->getUserGrowthByMonth($startDate, $endDate);
             $currentDate = clone $startDate;
             $currentDate->startOfMonth();
             while ($currentDate <= $endDate) {
                 $monthStr = $currentDate->format('Y-m');
                 $monthData = $userGrowthRawMonth->firstWhere('month', $monthStr);
                 $runningTotal += $monthData ? $monthData->count : 0;
                 $userGrowth[] = [
                     'date' => $currentDate->format('M Y'),
                     'count' => $runningTotal
                 ];
                 $currentDate->addMonth();
             }
        }
        return $userGrowth;
    }

    protected function getHourlyData($startDate, $endDate, $diffInHours)
    {
        $hourlyData = [];
        if ($diffInHours <= 48) {
            $healthDataRaw = MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
                ->selectRaw('DATE_FORMAT(checked_at, "%Y-%m-%d %H:00:00") as time_bucket, ROUND(AVG(is_up) * 100, 1) as uptime, ROUND(AVG(CASE WHEN is_up = 1 THEN response_time_ms ELSE NULL END)) as response_time')
                ->groupBy('time_bucket')
                ->orderBy('time_bucket')
                ->get();
                
            $currentDate = clone $startDate;
            $currentDate->startOfHour();
            while ($currentDate <= $endDate) {
                $bucket = $currentDate->format('Y-m-d H:00:00');
                $data = $healthDataRaw->firstWhere('time_bucket', $bucket);
                $hourlyData[] = [
                    'time' => $currentDate->format('M d, H:00'),
                    'uptime' => $data ? (float)$data->uptime : 100,
                    'response_time' => $data && $data->response_time ? (int)$data->response_time : 0
                ];
                $currentDate->addHour();
            }
        } else {
            $healthDataRaw = MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
                ->selectRaw('DATE(checked_at) as time_bucket, ROUND(AVG(is_up) * 100, 1) as uptime, ROUND(AVG(CASE WHEN is_up = 1 THEN response_time_ms ELSE NULL END)) as response_time')
                ->groupBy('time_bucket')
                ->orderBy('time_bucket')
                ->get();
                
            $currentDate = clone $startDate;
            $currentDate->startOfDay();
            while ($currentDate <= $endDate) {
                $bucket = $currentDate->format('Y-m-d');
                $data = $healthDataRaw->firstWhere('time_bucket', $bucket);
                $hourlyData[] = [
                    'time' => $currentDate->format('M d'),
                    'uptime' => $data ? (float)$data->uptime : 100,
                    'response_time' => $data && $data->response_time ? (int)$data->response_time : 0
                ];
                $currentDate->addDay();
            }
        }
        return $hourlyData;
    }

    protected function getDomainStatusDistribution()
    {
        return DomainUrl::selectRaw('current_status, COUNT(*) as count')
            ->groupBy('current_status')
            ->pluck('count', 'current_status')
            ->toArray();
    }

    protected function getNotificationStats($startDate, $endDate)
    {
        return NotificationQueue::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('type, status, COUNT(*) as count')
            ->groupBy('type', 'status')
            ->get();
    }
}
