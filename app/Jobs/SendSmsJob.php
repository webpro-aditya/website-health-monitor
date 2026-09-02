<?php

namespace App\Jobs;

use App\Models\NotificationQueue;
use App\Models\SmsConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendSmsJob implements ShouldQueue
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
            $config = SmsConfig::first();
            if (!$config || !$config->is_active) {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'SMS config is inactive or not found.',
                    'provider_response' => 'Config inactive',
                ]);
                return;
            }

            $recipient = $this->notification->recipient;
            if (!$recipient) {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'Recipient phone number not found.'
                ]);
                return;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config->api_key,
                'Content-Type' => 'application/json'
            ])->post($config->api_url, [
                'to' => $recipient,
                'sender' => $config->sender_id,
                'message' => $this->notification->message,
            ]);

            if ($response->successful()) {
                $this->notification->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                    'provider_response' => $response->body()
                ]);
            } else {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'API Error: ' . $response->status(),
                    'provider_response' => $response->body(),
                    'retry_count' => $this->attempts(),
                ]);
                throw new \Exception('API Error: ' . $response->body());
            }
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
