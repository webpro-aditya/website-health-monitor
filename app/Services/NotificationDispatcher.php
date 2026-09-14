<?php

namespace App\Services;

use App\Models\DomainUrl;
use App\Models\NotificationQueue;
use App\Models\EmailConfig;
use App\Jobs\SendEmailJob;
use App\Jobs\SendSmsJob;
use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    /**
     * Dispatch notifications for a state change event.
     *
     * @param DomainUrl $domain
     * @param string $eventType 'domain_down' or 'domain_recovered'
     */
    public static function dispatch(DomainUrl $domain, string $eventType)
    {
        $user = $domain->user;
        if (!$user) return;

        // Implement cooldown logic
        if ($eventType === 'domain_down' && $domain->last_notified_at) {
            // If notified within last 30 minutes, skip
            if ($domain->last_notified_at->diffInMinutes(now()) < 30) {
                Log::channel('cron')->info("Skipping notification for {$domain->domain_name} (Cooldown active)");
                return;
            }
        }

        // Build base data
        $domainName = $domain->domain_name ?: $domain->url;
        $timestamp = now()->format('Y-m-d H:i:s');
        
        $message = $eventType === 'domain_down' 
            ? "ALERT: {$domainName} is DOWN as of {$timestamp}."
            : "RESOLVED: {$domainName} is UP again as of {$timestamp}.";

        // Dispatch Emails
        $emails = [];
        if (!empty($user->email)) $emails[] = $user->email;
        if (!empty($user->notification_emails)) {
            $emails = array_merge($emails, array_map('trim', explode(',', $user->notification_emails)));
        }

        $emailConfig = EmailConfig::first();
        if ($emailConfig && !empty($emailConfig->notification_emails)) {
            $emails = array_merge($emails, array_map('trim', explode(',', $emailConfig->notification_emails)));
        }

        $emails = array_unique(array_filter($emails));

        foreach ($emails as $email) {
            $notification = NotificationQueue::create([
                'user_id' => $user->id,
                'domain_url_id' => $domain->id,
                'type' => 'email',
                'event_type' => $eventType,
                'recipient' => $email,
                'message' => $message,
                'status' => 'queued',
            ]);
            SendEmailJob::dispatch($notification)->onQueue('emails');
        }

        // Dispatch SMS
        $phones = [];
        if (!empty($user->notification_phones)) {
            $phones = array_merge($phones, array_map('trim', explode(',', $user->notification_phones)));
        }
        $phones = array_unique(array_filter($phones));

        foreach ($phones as $phone) {
            $notification = NotificationQueue::create([
                'user_id' => $user->id,
                'domain_url_id' => $domain->id,
                'type' => 'sms',
                'event_type' => $eventType,
                'recipient' => $phone,
                'message' => $message,
                'status' => 'queued',
            ]);
            SendSmsJob::dispatch($notification)->onQueue('sms');
        }

        // Update last notified time on the in-memory model.
        // Important: Do NOT use $domain->update() here because CheckDomainJob::handle()
        // calls $domain->save() after this, which would overwrite the DB value.
        if (count($emails) > 0 || count($phones) > 0) {
            $domain->last_notified_at = now();
        }
    }
}
