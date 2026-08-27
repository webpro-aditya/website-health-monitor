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
                    'error_log' => 'SMS config is inactive or not found.'
                ]);
                return;
            }

            $user = $this->notification->user;
            if (!$user || empty($user->phone)) {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'User phone number not found.'
                ]);
                return;
            }

            // A generic HTTP API integration based on SmsConfig.
            // Usually, APIs use POST and JSON, or GET with query params.
            // Let's assume a standard POST request for sending SMS.
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $config->api_key,
                'Content-Type' => 'application/json'
            ])->post($config->api_url, [
                'to' => $user->phone, // Assumes user has a phone field
                'sender' => $config->sender_id,
                'message' => $this->notification->message,
            ]);

            if ($response->successful()) {
                $this->notification->update(['status' => 'sent']);
            } else {
                $this->notification->update([
                    'status' => 'failed',
                    'error_log' => 'API Error: ' . $response->body()
                ]);
            }
        } catch (\Exception $e) {
            $this->notification->update([
                'status' => 'failed',
                'error_log' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
