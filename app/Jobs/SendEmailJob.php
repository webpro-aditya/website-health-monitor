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
                    'error_log' => 'Email config is inactive or not found.'
                ]);
                return;
            }

            // Set mail configuration dynamically
            config([
                'mail.mailers.smtp.host' => $config->smtp_host,
                'mail.mailers.smtp.port' => $config->smtp_port,
                'mail.mailers.smtp.encryption' => $config->smtp_encryption,
                'mail.mailers.smtp.username' => $config->smtp_user,
                'mail.mailers.smtp.password' => $config->smtp_password,
                'mail.from.address' => $config->from_email,
                'mail.from.name' => $config->from_name,
            ]);

            // For now, if the notification is user specific we could look up the user's email,
            // but the domain url is linked. Let's send to the user's email.
            $user = $this->notification->user;
            
            if (!$user) {
                throw new \Exception("User not found for notification.");
            }

            // A simple raw email or Markdown email could be used.
            Mail::raw($this->notification->message, function ($message) use ($user, $config) {
                $message->to($user->email)
                        ->subject('Website Monitoring Alert');
            });

            $this->notification->update(['status' => 'sent']);
        } catch (\Exception $e) {
            $this->notification->update([
                'status' => 'failed',
                'error_log' => $e->getMessage()
            ]);
            
            // Re-throw to let Laravel Queue handle retries if needed, 
            // or just let it fail gracefully since we logged it in DB.
            throw $e;
        }
    }
}
