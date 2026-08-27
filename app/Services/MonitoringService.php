<?php

namespace App\Services;

use App\Models\DomainUrl;
use App\Models\Tracking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MonitoringService
{
    public function checkDomains()
    {
        $domains = DomainUrl::with('user')
            ->where('status', 'enabled')
            ->whereHas('user', function ($q) {
                $q->where('is_active', true);
            })
            ->get();

        foreach ($domains as $domain) {
            $this->checkDomain($domain);
        }
    }

    protected function checkDomain(DomainUrl $domain)
    {
        $start = microtime(true);
        $isUp = false;
        
        try {
            $response = Http::timeout(10)->get($domain->url);
            $isUp = $response->successful();
        } catch (\Exception $e) {
            Log::error("Health check failed for {$domain->url}: " . $e->getMessage());
        }

        $durationMs = round((microtime(true) - $start) * 1000);
        
        $domain->update([
            'domain_status' => $isUp,
            'response_time' => $durationMs,
            'last_checked' => now(),
        ]);

        $tracking = Tracking::firstOrNew(['url' => $domain->url]);
        
        if (!$isUp && $tracking->last_status) {
            $tracking->down_since = now();
            
            // Log Downtime Alert to Queue
            $message = "ALERT: Your domain {$domain->domain_name} ({$domain->url}) is DOWN.";
            \App\Models\NotificationQueue::create([
                'user_id' => $domain->user_id,
                'domain_url_id' => $domain->id,
                'type' => 'email',
                'message' => $message,
            ]);
            \App\Models\NotificationQueue::create([
                'user_id' => $domain->user_id,
                'domain_url_id' => $domain->id,
                'type' => 'sms',
                'message' => $message,
            ]);
            
        } elseif ($isUp && !$tracking->last_status && $tracking->exists) {
            $tracking->down_since = null;
            
            // Log Uptime Alert to Queue
            $message = "RESOLVED: Your domain {$domain->domain_name} ({$domain->url}) is UP again.";
            \App\Models\NotificationQueue::create([
                'user_id' => $domain->user_id,
                'domain_url_id' => $domain->id,
                'type' => 'email',
                'message' => $message,
            ]);
            \App\Models\NotificationQueue::create([
                'user_id' => $domain->user_id,
                'domain_url_id' => $domain->id,
                'type' => 'sms',
                'message' => $message,
            ]);
        }
        
        $tracking->last_status = $isUp;
        $tracking->last_checked = now();
        $tracking->response_time_ms = $durationMs;
        $tracking->save();
    }
}
