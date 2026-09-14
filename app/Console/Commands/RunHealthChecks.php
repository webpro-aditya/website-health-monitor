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

        $count = 0;
        $activeDomainIdsCache = [];
        $batchSize = 50;
        $currentBatch = [];

        // Use chunkById to process domains in memory-efficient batches
        // This replaces the old take(100) bottleneck and can handle 50,000+ domains
        DomainUrl::with('user.subscriptions')
            ->dueForCheck()
            ->chunkById(500, function ($domains) use (&$count, &$activeDomainIdsCache, &$currentBatch, $batchSize) {
                foreach ($domains as $domain) {
                    $user = $domain->user;
                    
                    // Determine active domain IDs for this user to enforce limits
                    if (!isset($activeDomainIdsCache[$user->id])) {
                        $limit = $user->getMaxDomainsLimit();
                        $activeDomainIdsCache[$user->id] = $user->domains()
                            ->where('status', 'enabled')
                            ->orderBy('id', 'asc')
                            ->limit($limit)
                            ->pluck('id')
                            ->toArray();
                    }

                    // Check if this domain exceeds the limit (is frozen)
                    if (!in_array($domain->id, $activeDomainIdsCache[$user->id])) {
                        // Push the next check out by a day so it doesn't get queried every minute
                        $domain->update(['next_check_at' => now()->addHours(24)]);
                        continue;
                    }

                    $currentBatch[] = $domain->id;

                    if (count($currentBatch) >= $batchSize) {
                        \App\Jobs\CheckDomainBatchJob::dispatch($currentBatch)
                            ->onQueue('monitoring');
                        $currentBatch = [];
                    }

                    // Dynamically calculate the interval in case the user's subscription changed
                    $interval = $domain->getIntervalForSubscription();

                    // Optimistically update next_check_at to prevent re-fetching before the job completes
                    // and update the check_interval so it's always in sync with the DB
                    $domain->update([
                        'check_interval' => $interval,
                        'next_check_at' => now()->addSeconds($interval)
                    ]);
                    
                    $count++;
                }
            });

        // Dispatch any remaining domains in the last batch
        if (!empty($currentBatch)) {
            \App\Jobs\CheckDomainBatchJob::dispatch($currentBatch)
                ->onQueue('monitoring');
        }

        Log::channel('cron')->info("Dispatched {$count} domain checks in batches of {$batchSize}.");
    }
}
