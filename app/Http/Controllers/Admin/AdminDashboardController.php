<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainUrl;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use App\Http\Requests\BulkToggleLoggingRequest;
use Carbon\Carbon;
use Inertia\Inertia;

use App\Models\EmailConfig;
use App\Models\SmsConfig;

class AdminDashboardController extends Controller
{
    public function index(Request $request, \App\Repositories\UserRepository $userRepo, \App\Services\AdminAnalyticsService $analyticsService)
    {
        $users = $userRepo->getUsersWithActiveSubscriptionsAndDomainCounts();

        $plansMap = [
            config('services.razorpay.plan_starter_monthly') => 'Starter Monthly',
            config('services.razorpay.plan_starter_yearly') => 'Starter Yearly',
            config('services.razorpay.plan_pro_monthly') => 'Pro Monthly',
            config('services.razorpay.plan_pro_yearly') => 'Pro Yearly',
            config('services.razorpay.plan_enterprise_monthly') => 'Enterprise Monthly',
            config('services.razorpay.plan_enterprise_yearly') => 'Enterprise Yearly',
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
        
        $period = $request->query('period', '24h');
        $customStart = $request->query('start_date');
        $customEnd = $request->query('end_date');

        $analytics = $analyticsService->getDashboardAnalytics($period, $customStart, $customEnd);

        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => $userRepo->getRegisteredUsersCount(),
            'totalDomains' => DomainUrl::count(),
            'users' => $users,
            'emailConfig' => EmailConfig::first() ?? new EmailConfig(),
            'smsConfig' => SmsConfig::first() ?? new SmsConfig(),
            'analytics' => $analytics
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

    public function toggleAccess(User $user)
    {
        // Prevent admin from disabling themselves
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $status = $user->is_active ? 'enabled' : 'disabled';
        return back()->with('success', "Account access $status for " . $user->name);
    }

    public function bulkToggleLogging(BulkToggleLoggingRequest $request)
    {
        User::whereIn('id', $request->user_ids)->update(['activity_logging_enabled' => $request->enabled]);

        return back()->with('success', 'Bulk activity logging settings updated.');
    }

    public function analyticsUsers(Request $request, \App\Services\AdminAnalyticsService $analyticsService)
    {
        $date = $request->query('date');
        $users = $analyticsService->getUsersAnalyticsData($date);
        
        return response()->json(['data' => $users]);
    }

    public function analyticsMonitoring(Request $request, \App\Services\AdminAnalyticsService $analyticsService)
    {
        $timeBucket = $request->query('time_bucket');
        $logs = $analyticsService->getMonitoringAnalyticsData($timeBucket);

        return response()->json(['data' => $logs]);
    }

    public function analyticsDomains(Request $request, \App\Services\AdminAnalyticsService $analyticsService)
    {
        $status = $request->query('status');
        $domains = $analyticsService->getDomainsAnalyticsData($status);
            
        return response()->json(['data' => $domains]);
    }
}
