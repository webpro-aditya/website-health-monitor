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

    public function bulkToggleLogging(BulkToggleLoggingRequest $request)
    {
        User::whereIn('id', $request->user_ids)->update(['activity_logging_enabled' => $request->enabled]);

        return back()->with('success', 'Bulk activity logging settings updated.');
    }

    public function analyticsUsers(Request $request)
    {
        $date = $request->query('date');
        $query = User::query();
        if (strlen($date) === 7) {
            $query->whereYear('created_at', substr($date, 0, 4))
                  ->whereMonth('created_at', substr($date, 5, 2));
        } else {
            $query->whereDate('created_at', $date);
        }
        
        $users = $query->with('subscriptions')->get()->map(function($u) {
            $plan = 'No Plan';
            if ($u->subscriptions->count() > 0) {
                $plan = $u->subscriptions->first()->plan_name;
            } elseif ($u->trial_ends_at && $u->trial_ends_at->isFuture()) {
                $plan = 'Free Trial';
            }
            return [
                'name' => $u->name,
                'email' => $u->email,
                'plan' => $plan,
                'joined' => $u->created_at->format('Y-m-d H:i')
            ];
        });
        
        return response()->json(['data' => $users]);
    }

    public function analyticsMonitoring(Request $request)
    {
        $timeBucket = $request->query('time_bucket');
        if (strpos($timeBucket, ' ') !== false) {
            $start = Carbon::parse($timeBucket);
            $end = $start->copy()->addHour();
        } else {
            $start = Carbon::parse($timeBucket)->startOfDay();
            $end = Carbon::parse($timeBucket)->endOfDay();
        }

        $logs = \App\Models\MonitoringLog::with('domain')
            ->whereBetween('checked_at', [$start, $end])
            ->where(function($q) {
                $q->where('is_up', 0)
                  ->orWhere('response_time_ms', '>', 1000);
            })
            ->orderBy('is_up', 'asc')
            ->orderBy('response_time_ms', 'desc')
            ->take(50)
            ->get()
            ->map(function($log) {
                return [
                    'url' => $log->domain ? $log->domain->url : 'Unknown',
                    'status' => $log->is_up ? 'UP' : 'DOWN',
                    'response_time' => $log->response_time_ms . 'ms',
                    'time' => $log->checked_at->format('Y-m-d H:i:s')
                ];
            });

        return response()->json(['data' => $logs]);
    }

    public function analyticsDomains(Request $request)
    {
        $status = $request->query('status');
        $domains = DomainUrl::with('user')
            ->where('current_status', $status)
            ->take(100)
            ->get()
            ->map(function($d) {
                return [
                    'url' => $d->url,
                    'owner' => $d->user ? $d->user->email : 'Unknown',
                    'last_checked' => $d->last_checked_at ? $d->last_checked_at->diffForHumans() : 'Never'
                ];
            });
            
        return response()->json(['data' => $domains]);
    }
}
