<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DomainUrl;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

use App\Models\EmailConfig;
use App\Models\SmsConfig;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard', [
            'totalUsers' => User::count(),
            'totalDomains' => DomainUrl::count(),
            'users' => User::withCount('domains')->get(),
            'emailConfig' => EmailConfig::first() ?? new EmailConfig(),
            'smsConfig' => SmsConfig::first() ?? new SmsConfig(),
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
}
