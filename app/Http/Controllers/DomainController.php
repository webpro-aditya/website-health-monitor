<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\DomainRepository;
use Inertia\Inertia;
use App\Models\DomainUrl;
use App\Services\ActivityLogger;
use Illuminate\Validation\Rule;
use App\Http\Requests\StoreDomainRequest;
use App\Http\Requests\UpdateDomainRequest;
use App\Http\Requests\SetAllDomainsRequest;
use App\Http\Requests\SaveNotificationsRequest;
use App\Http\Requests\SaveAdvancedSettingsRequest;

class DomainController extends Controller
{
    protected $domainRepository;

    public function __construct(DomainRepository $domainRepository)
    {
        $this->domainRepository = $domainRepository;
    }

    public function index(Request $request, \App\Services\SubscriptionService $subscriptionService)
    {
        $user = $request->user();
        $domainsRaw = $this->domainRepository->getAllForUser($user->id);
        
        $limit = $user->getMaxDomainsLimit();
        $activeCount = 0;
        
        $domains = $domainsRaw->map(function ($domain) use (&$activeCount, $limit) {
            $statusFlag = 'DISABLED';
            if ($domain->status === 'enabled') {
                if ($activeCount >= $limit) {
                    $statusFlag = 'FROZEN';
                } else {
                    $activeCount++;
                    if (is_null($domain->last_checked)) {
                        $statusFlag = 'PENDING';
                    } else {
                        $statusFlag = $domain->domain_status ? 'UP' : 'DOWN';
                    }
                }
            }

            return [
                'id'       => $domain->id,
                'name'     => $domain->domain_name ?? 'Unknown',
                'url'      => $domain->url,
                'status'   => $statusFlag,
                'enabled'  => $domain->status === 'enabled',
                'response' => $domain->response_time ? round($domain->response_time) . 'ms' : '--',
                'checked'  => $domain->last_checked ? $domain->last_checked->format('Y-m-d H:i') : 'Never'
            ];
        })->sortByDesc('id')->values();
        
        $alertEmails = $user->notification_emails ?: [];
        if (is_string($alertEmails)) $alertEmails = explode(',', $alertEmails);
        
        $alertPhones = $user->notification_phones ?: [];
        if (is_string($alertPhones)) $alertPhones = explode(',', $alertPhones);
        
        $advancedSettings = $user->advanced_settings ?: [];
        if (is_string($advancedSettings)) $advancedSettings = json_decode($advancedSettings, true) ?: [];

        $planDetails = $subscriptionService->getBasicPlanDetails($user);

        return Inertia::render('Dashboard', [
            'domains' => $domains,
            'initialAlertEmails' => $alertEmails,
            'initialAlertPhones' => $alertPhones,
            'initialAdvancedSettings' => $advancedSettings,
            'subscriptionDetails' => $planDetails
        ]);
    }



    public function store(StoreDomainRequest $request)
    {
        $user = $request->user();
        
        if ($user->domains()->count() >= $user->getMaxDomainsLimit()) {
            return back()->withErrors(['url' => 'You have reached the maximum number of domains allowed on your current plan. Please upgrade to add more.']);
        }

        $this->domainRepository->save(
            $request->domain_name,
            $request->url,
            'enabled',
            $user->id
        );

        ActivityLogger::log($user, 'added_domain', "Added new domain: {$request->url}");

        return back()->with('success', 'Domain added successfully.');
    }

    public function update(UpdateDomainRequest $request, $id)
    {

        $domain = $this->domainRepository->findByIdAndUser($id, $request->user()->id);
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
        $domain = $this->domainRepository->findByIdAndUser($id, $request->user()->id);
        if ($domain) {
            $url = $domain->url;
            $this->domainRepository->delete($id, $request->user()->id);
            ActivityLogger::log($request->user(), 'deleted_domain', "Deleted domain: {$url}");
        }
        return back()->with('success', 'Domain deleted successfully.');
    }

    public function setAll(SetAllDomainsRequest $request)
    {
        $status = $request->enabled ? 'enabled' : 'disabled';
        
        $this->domainRepository->setAll($status, $request->user()->id);
            
        return back()->with('success', 'All domains updated successfully.');
    }

    public function saveNotifications(SaveNotificationsRequest $request)
    {

        $validEmails = array_filter($request->emails ?: [], function($email) {
            return !empty(trim($email));
        });
        
        $validPhones = array_filter($request->phones ?: [], function($phone) {
            return !empty(trim($phone));
        });

        $user = $request->user();
        $user->notification_emails = $validEmails;
        $user->notification_phones = $validPhones;
        $user->save();

        return back()->with('success', 'Preferences saved successfully.');
    }
    public function saveAdvancedSettings(SaveAdvancedSettingsRequest $request)
    {

        $user = $request->user();
        $user->advanced_settings = $request->settings;
        $user->save();

        return back()->with('success', 'Advanced settings saved successfully.');
    }
}
