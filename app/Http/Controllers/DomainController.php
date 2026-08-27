<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\DomainRepository;
use Inertia\Inertia;
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
            
        $advancedSettings = $user->advanced_settings 
            ? json_decode($user->advanced_settings, true) 
            : null;

        return Inertia::render('Dashboard', [
            'domains' => $domains,
            'initialAlertEmails' => $alertEmails,
            'initialAlertPhones' => $alertPhones,
            'initialAdvancedSettings' => $advancedSettings
        ]);
    }



    public function store(Request $request)
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
                })
            ],
        ], [
            'url.unique' => 'You have already added this domain URL.'
        ]);

        $this->domainRepository->save(
            $request->domain_name,
            $request->url,
            'enabled',
            $request->user()->id
        );

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

        $this->domainRepository->save(
            $request->domain_name,
            $request->url,
            $request->status,
            $request->user()->id,
            $id
        );

        return back()->with('success', 'Domain updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $this->domainRepository->delete($id, $request->user()->id);
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
