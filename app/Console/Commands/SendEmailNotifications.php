<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\NotificationQueue;
use App\Jobs\SendEmailJob;
use Illuminate\Support\Facades\Log;

class SendEmailNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notify:emails';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch pending email notifications to the queue';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::channel('cron')->info('SendEmailNotifications started.');

        $pendingEmails = NotificationQueue::where('type', 'email')
                            ->where('status', 'pending')
                            ->get();

        $count = 0;
        foreach ($pendingEmails as $notification) {
            $notification->update(['status' => 'queued']);
            SendEmailJob::dispatch($notification)->onQueue('emails');
            $count++;
        }

        Log::channel('cron')->info("SendEmailNotifications completed. Queued {$count} emails.");
    }
}
