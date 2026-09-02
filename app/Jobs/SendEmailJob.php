<?php

namespace App\Jobs;

use App\Models\NotificationQueue;
use App\Models\EmailConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $notification;

    public $tries = 3;
    public $backoff = [30, 60, 120];

    public function __construct(NotificationQueue $notification)
    {
        $this->notification = $notification;
    }

    public function handle(): void
    {
        try {
            $config = EmailConfig::first();
            if (!$config || !$config->is_active) {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'Email config is inactive or not found.',
                    'provider_response' => 'Config inactive',
                ]);
                return;
            }

            // Set mail configuration dynamically
            config([
                'mail.mailers.smtp.host' => $config->smtp_host,
                'mail.mailers.smtp.port' => $config->smtp_port,
                'mail.mailers.smtp.encryption' => $config->smtp_encryption,
                'mail.mailers.smtp.username' => $config->smtp_username,
                'mail.mailers.smtp.password' => $config->smtp_password,
                'mail.from.address' => $config->from_email,
                'mail.from.name' => $config->from_name,
            ]);

            $recipient = $this->notification->recipient;
            
            if (!$recipient) {
                throw new \Exception("Recipient not found for notification.");
            }

            if ($this->notification->event_type === 'domain_down') {
                Mail::to($recipient)->send(new \App\Mail\DomainDownAlert($this->notification));
            } elseif ($this->notification->event_type === 'domain_recovered') {
                Mail::to($recipient)->send(new \App\Mail\DomainRecoveredAlert($this->notification));
            } else {
                Mail::raw($this->notification->message, function ($message) use ($recipient) {
                    $message->to($recipient)
                            ->subject('Website Monitoring Alert');
                });
            }

            $this->notification->update([
                'status' => 'sent',
                'sent_at' => now(),
            ]);
        } catch (\Exception $e) {
            $this->notification->update([
                'status' => 'failed',
                'error_log' => $e->getMessage(),
                'retry_count' => $this->attempts(),
            ]);
            
            throw $e;
        }
    }
}
