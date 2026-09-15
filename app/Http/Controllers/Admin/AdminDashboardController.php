<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainUrl;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\EmailConfig;
use App\Models\SmsConfig;

class AdminDashboardController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('role', '!=', 'admin')->withCount('domains')->with(['subscriptions' => function($q) {
            $q->where('status', 'active');
        }])->get();

        $plansMap = [
            env('RAZORPAY_PLAN_STARTER_MONTHLY') => 'Starter Monthly',
            env('RAZORPAY_PLAN_STARTER_YEARLY') => 'Starter Yearly',
            env('RAZORPAY_PLAN_PRO_MONTHLY') => 'Pro Monthly',
            env('RAZORPAY_PLAN_PRO_YEARLY') => 'Pro Yearly',
            env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') => 'Enterprise Monthly',
            env('RAZORPAY_PLAN_ENTERPRISE_YEARLY') => 'Enterprise Yearly',
        ];

        $users->map(function ($user) use ($plansMap) {
            $activeSub = $user->subscriptions->first();
            if ($activeSub) {
                $user->plan_name = $plansMap[$activeSub->plan_name] ?? 'Custom Plan';
            } elseif ($user->trial_ends_at && $user->trial_ends_at->isFuture()) {
                $user->plan_name = 'Free Trial';
            } elseif ($user->role === 'admin') {
                $user->plan_name = 'Admin';
            } else {
                $user->plan_name = 'No Plan';
            }
            return $user;
        });
        
        // --- Analytics Data ---
        $period = $request->query('period', '24h');
        
        if ($period === 'custom') {
            $startDate = \Carbon\Carbon::parse($request->query('start_date'))->startOfDay();
            $endDate = \Carbon\Carbon::parse($request->query('end_date'))->endOfDay();
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
        
        $diffInDays = $startDate->diffInDays($endDate);
        $diffInHours = $startDate->diffInHours($endDate);
        
        // 1. Uptime Rate (Selected Range)
        $uptimeRate = \App\Models\MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
            ->selectRaw('ROUND(AVG(is_up) * 100, 2) as rate')
            ->value('rate') ?? 0;
            
        // 2. Alerts Sent (Selected Range)
        $alertsSent = \App\Models\NotificationQueue::where('status', 'sent')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();
            
        // 3. User Growth
        $userGrowthRaw = User::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();
            
        $userGrowth = [];
        $runningTotal = User::where('created_at', '<', $startDate)->count();
        
        // Generate continuous dates for the chart
        if ($diffInDays <= 31) {
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
             // For > 31 days (e.g. 1y), group by month to save rendering space
             $userGrowthRawMonth = User::whereBetween('created_at', [$startDate, $endDate])
                ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, COUNT(*) as count')
                ->groupBy('month')
                ->orderBy('month')
                ->get();
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

        // 4. Uptime & Response Time
        // Adaptive grouping: By Hour if <= 48 hours, by Date if > 48 hours
        $hourlyData = [];
        if ($diffInHours <= 48) {
            $healthDataRaw = \App\Models\MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
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
            $healthDataRaw = \App\Models\MonitoringLog::whereBetween('checked_at', [$startDate, $endDate])
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

        // 5. Domain Status Distribution
        $domainStatus = DomainUrl::selectRaw('current_status, COUNT(*) as count')
            ->groupBy('current_status')
            ->pluck('count', 'current_status')
            ->toArray();
            
        // 6. Subscription Breakdown
        $subscriptionCounts = collect($users)->groupBy('plan_name')->map->count();
        
        // 7. Notification Stats
        $notificationStats = \App\Models\NotificationQueue::whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('type, status, COUNT(*) as count')
            ->groupBy('type', 'status')
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => User::where('role', '!=', 'admin')->count(),
            'totalDomains' => DomainUrl::count(),
            'users' => $users,
            'emailConfig' => EmailConfig::first() ?? new EmailConfig(),
            'smsConfig' => SmsConfig::first() ?? new SmsConfig(),
            
            // New Analytics Props
            'analytics' => [
                'uptimeRate' => (float) $uptimeRate,
                'alertsSent' => $alertsSent,
                'userGrowth' => $userGrowth,
                'hourlyData' => $hourlyData,
                'domainStatus' => $domainStatus,
                'subscriptionCounts' => $subscriptionCounts,
                'notificationStats' => $notificationStats,
            ]
        ]);
    }

    public function updateEmailConfig(Request $request)
    {
        $config = EmailConfig::first() ?? new EmailConfig();
        $config->smtp_host = $request->smtp_host;
        $config->smtp_port = $request->smtp_port;
        $config->smtp_username = $request->smtp_username;
        $config->smtp_password = $request->smtp_password;
        $config->from_email = $request->from_email;
        $config->from_name = $request->from_name;
        $config->notification_emails = $request->notification_emails;
        $config->is_active = $request->boolean('is_active');
        $config->save();

        return back()->with('success', 'Email configuration saved.');
    }

    public function updateSmsConfig(Request $request)
    {
        $config = SmsConfig::first() ?? new SmsConfig();
        $config->api_endpoint = $request->api_endpoint;
        $config->api_key = $request->api_key;
        $config->sender_id = $request->sender_id;
        $config->notification_numbers = $request->notification_numbers;
        $config->is_active = $request->boolean('is_active');
        $config->save();

        return back()->with('success', 'SMS configuration saved.');
    }

    public function activityLogs(Request $request)
    {
        $logs = ActivityLog::with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(100);

        return response()->json(['logs' => $logs]);
    }

    public function toggleLogging(User $user)
    {
        $user->activity_logging_enabled = !$user->activity_logging_enabled;
        $user->save();

        return back()->with('success', 'Activity logging toggled for ' . $user->name);
    }

    public function bulkToggleLogging(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
            'enabled' => 'required|boolean'
        ]);

        User::whereIn('id', $request->user_ids)->update(['activity_logging_enabled' => $request->enabled]);

        return back()->with('success', 'Bulk activity logging settings updated.');
    }
}
