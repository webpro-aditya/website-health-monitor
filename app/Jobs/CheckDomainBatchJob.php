<?php

namespace App\Jobs;

use App\Models\DomainUrl;
use App\Services\MonitoringService;
use App\Services\MonitoringResult;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\Pool;

class CheckDomainBatchJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $domainIds;
    public $timeout = 120; // 2 minutes max to process a batch

    /**
     * Create a new job instance.
     *
     * @param array $domainIds
     */
    public function __construct(array $domainIds)
    {
        $this->domainIds = $domainIds;
    }

    /**
     * Execute the job.
     */
    public function handle(MonitoringService $monitoringService): void
    {
        $domains = DomainUrl::whereIn('id', $this->domainIds)
            ->where('status', 'enabled')
            ->get()
            ->keyBy('id');
            
        if ($domains->isEmpty()) {
            return;
        }

        $startTimes = [];
        foreach ($domains as $id => $domain) {
            $startTimes[$id] = microtime(true);
        }

        // 1. Fire all HTTP requests CONCURRENTLY
        $responses = Http::pool(function (Pool $pool) use ($domains) {
            foreach ($domains as $domain) {
                $pool->as("domain_{$domain->id}")
                     ->withoutVerifying()
                     ->timeout(15) // Wait up to 15s for each connection
                     ->get($domain->url);
            }
        });

        // 2. Process results and retry failures
        $failedDomains = [];
        
        foreach ($domains as $domain) {
            $key = "domain_{$domain->id}";
            $response = $responses[$key] ?? null;
            
            $durationMs = round((microtime(true) - $startTimes[$domain->id]) * 1000);
            
            if ($response && $response instanceof \Illuminate\Http\Client\Response) {
                if ($response->successful()) {
                    // Site is UP — record result immediately
                    $result = new MonitoringResult(true, (int)$durationMs, $response->status(), null);
                    $monitoringService->recordResult($domain, $result);
                } else {
                    // Site returned an error (500, 404, etc.)
                    $failedDomains[] = $domain->id;
                }
            } elseif ($response instanceof \Exception) {
                // Connection error, timeout, etc.
                $failedDomains[] = $domain->id;
            } else {
                // Unknown failure
                $failedDomains[] = $domain->id;
            }
        }
        
        // 3. Fast-retry: Re-check all failed domains concurrently via Retry Job
        if (!empty($failedDomains)) {
            CheckDomainRetryJob::dispatch($failedDomains, 1)
                ->onQueue('monitoring')
                ->delay(now()->addSeconds(5));
        }
    }
}
