<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\DomainRepository;
use Inertia\Inertia;
use App\Models\DomainUrl;
use App\Services\ActivityLogger;
use Illuminate\Validation\Rule;

class DomainController extends Controller
{
    protected $domainRepository;

    public function __construct(DomainRepository $domainRepository)
    {
        $this->domainRepository = $domainRepository;
    }

    public function index(Request $request, \App\Contracts\PaymentGatewayInterface $gateway)
    {
        $user = $request->user();
        $domains = $this->domainRepository->getAllForUser($user->id);
        
        $alertEmails = $user->notification_emails 
            ? explode(',', $user->notification_emails) 
            : [];
            
        $alertPhones = $user->notification_phones 
            ? explode(',', $user->notification_phones) 
            : [];
            
        $advancedSettings = is_string($user->advanced_settings) 
            ? json_decode($user->advanced_settings, true) 
            : $user->advanced_settings;

        $activeSubscription = $user->subscriptions()->where('status', 'active')->first();
        $planDetails = [
            'name' => 'Free Trial',
            'expiry' => $user->trial_ends_at ? $user->trial_ends_at->format('M d, Y') : 'N/A'
        ];

        if ($activeSubscription) {
            $plansMap = [
                env('RAZORPAY_PLAN_STARTER_MONTHLY') => 'Starter Monthly',
                env('RAZORPAY_PLAN_STARTER_YEARLY') => 'Starter Yearly',
                env('RAZORPAY_PLAN_PRO_MONTHLY') => 'Pro Monthly',
                env('RAZORPAY_PLAN_PRO_YEARLY') => 'Pro Yearly',
                env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY') => 'Enterprise Monthly',
                env('RAZORPAY_PLAN_ENTERPRISE_YEARLY') => 'Enterprise Yearly',
            ];
            $planDetails['name'] = $plansMap[$activeSubscription->plan_name] ?? 'Custom Plan';
            try {
                $rzpSub = $gateway->getSubscription($activeSubscription->razorpay_subscription_id);
                if (isset($rzpSub['current_end'])) {
                    $planDetails['expiry'] = date('M d, Y', $rzpSub['current_end']);
                }
            } catch (\Exception $e) {}
        }

        return Inertia::render('Dashboard', [
            'domains' => $domains,
            'initialAlertEmails' => $alertEmails,
            'initialAlertPhones' => $alertPhones,
            'initialAdvancedSettings' => $advancedSettings,
            'subscriptionDetails' => $planDetails
        ]);
    }



    public function store(Request $request)
    {
        $user = $request->user();
        
        if ($user->domains()->count() >= $user->getMaxDomainsLimit()) {
            return back()->withErrors(['url' => 'You have reached the maximum number of domains allowed on your current plan. Please upgrade to add more.']);
        }

        $request->merge(['url' => rtrim($request->url, '/')]);
        
        $request->validate([
            'domain_name' => 'required|string|max:255',
            'url' => [
                'required',
                'url',
                'max:500',
                Rule::unique('domain_urls')->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->user()->id);
                })
            ],
        ], [
            'url.unique' => 'You have already added this domain URL.'
        ]);

        $this->domainRepository->save(
            $request->domain_name,
            $request->url,
            'enabled',
            $user->id
        );

        ActivityLogger::log($user, 'added_domain', "Added new domain: {$request->url}");

        return back()->with('success', 'Domain added successfully.');
    }

    public function update(Request $request, $id)
    {
        $request->merge(['url' => rtrim($request->url, '/')]);
        
        $request->validate([
            'domain_name' => 'required|string|max:255',
            'url' => [
                'required',
                'url',
                'max:500',
                Rule::unique('domain_urls')->where(function ($query) use ($request) {
                    return $query->where('user_id', $request->user()->id);
                })->ignore($id)
            ],
            'status' => 'required|in:enabled,disabled'
        ], [
            'url.unique' => 'You have already added this domain URL.'
        ]);

        $domain = DomainUrl::where('id', $id)->where('user_id', $request->user()->id)->first();
        $changes = [];
        if ($domain) {
            if ($domain->domain_name !== $request->domain_name) {
                $changes['domain_name'] = ['old' => $domain->domain_name, 'new' => $request->domain_name];
            }
            if ($domain->url !== $request->url) {
                $changes['url'] = ['old' => $domain->url, 'new' => $request->url];
            }
            if ($domain->status !== $request->status) {
                $changes['status'] = ['old' => $domain->status, 'new' => $request->status];
            }
        }

        $this->domainRepository->save(
            $request->domain_name,
            $request->url,
            $request->status,
            $request->user()->id,
            $id
        );

        if (!empty($changes)) {
            ActivityLogger::log($request->user(), 'updated_domain', "Updated domain: {$request->url}", $changes);
        } else {
            ActivityLogger::log($request->user(), 'updated_domain', "Updated domain: {$request->url}");
        }

        return back()->with('success', 'Domain updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $domain = DomainUrl::where('id', $id)->where('user_id', $request->user()->id)->first();
        if ($domain) {
            $url = $domain->url;
            $this->domainRepository->delete($id, $request->user()->id);
            ActivityLogger::log($request->user(), 'deleted_domain', "Deleted domain: {$url}");
        }
        return back()->with('success', 'Domain deleted successfully.');
    }

    public function setAll(Request $request)
    {
        $request->validate(['enabled' => 'required|boolean']);
        $status = $request->enabled ? 'enabled' : 'disabled';
        
        \App\Models\DomainUrl::where('user_id', $request->user()->id)
            ->update(['status' => $status]);
            
        return back()->with('success', 'All domains updated successfully.');
    }

    public function saveNotifications(Request $request)
    {
        $request->validate([
            'emails' => 'nullable|array',
            'emails.*' => 'nullable|email',
            'phones' => 'nullable|array',
            'phones.*' => 'nullable|string'
        ]);

        $validEmails = array_filter($request->emails ?: [], function($email) {
            return !empty(trim($email));
        });
        
        $validPhones = array_filter($request->phones ?: [], function($phone) {
            return !empty(trim($phone));
        });

        $user = $request->user();
        $user->notification_emails = implode(',', $validEmails);
        $user->notification_phones = implode(',', $validPhones);
        $user->save();

        return back()->with('success', 'Preferences saved successfully.');
    }
    public function saveAdvancedSettings(Request $request)
    {
        $request->validate([
            'settings' => 'required|array'
        ]);

        $user = $request->user();
        $user->advanced_settings = json_encode($request->settings);
        $user->save();

        return back()->with('success', 'Advanced settings saved successfully.');
    }
}
