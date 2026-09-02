<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DomainUrl;
use App\Jobs\CheckDomainJob;
use Illuminate\Support\Facades\Log;

class RunHealthChecks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'monitor:dispatch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch health check jobs for due domains';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        Log::channel('cron')->info('Starting domain monitoring dispatch...');

        $domains = DomainUrl::dueForCheck()->take(100)->get();
        $count = 0;

        foreach ($domains as $domain) {
            // Jitter to distribute load (0-10 seconds)
            $delay = rand(0, 10);
            
            CheckDomainJob::dispatch($domain->id)
                ->onQueue('monitoring')
                ->delay(now()->addSeconds($delay));

            // Optimistically update next_check_at to prevent re-fetching in next minute
            // The job will calculate the precise next_check_at based on its completion time
            $domain->update(['next_check_at' => now()->addMinutes(1)]);
            $count++;
        }

        Log::channel('cron')->info("Dispatched {$count} domain checks.");
    }
}
