<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NotificationQueue;
use App\Jobs\SendSmsJob;
use Illuminate\Support\Facades\Log;

class SendSmsNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notify:sms';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch pending SMS notifications to the queue';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::channel('cron')->info('SendSmsNotifications started.');

        $pendingSms = NotificationQueue::where('type', 'sms')
                            ->where('status', 'pending')
                            ->get();

        $count = 0;
        foreach ($pendingSms as $notification) {
            $notification->update(['status' => 'queued']);
            SendSmsJob::dispatch($notification)->onQueue('sms');
            $count++;
        }

        Log::channel('cron')->info("SendSmsNotifications completed. Queued {$count} SMS.");
    }
}
