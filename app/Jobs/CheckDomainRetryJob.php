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

class CheckDomainRetryJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $domainIds;
    public $attempt;
    public $maxAttempts = 3;
    public $timeout = 120; // 2 minutes max to process a batch

    /**
     * Create a new job instance.
     *
     * @param array $domainIds
     * @param int $attempt
     */
    public function __construct(array $domainIds, int $attempt = 1)
    {
        $this->domainIds = $domainIds;
        $this->attempt = $attempt;
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
        $stillFailingDomains = [];
        
        foreach ($domains as $domain) {
            $key = "domain_{$domain->id}";
            $response = $responses[$key] ?? null;
            
            $durationMs = round((microtime(true) - $startTimes[$domain->id]) * 1000);
            
            if ($response && $response instanceof \Illuminate\Http\Client\Response && $response->successful()) {
                // Site is UP on retry — record result immediately
                $result = new MonitoringResult(true, (int)$durationMs, $response->status(), null);
                $monitoringService->recordResult($domain, $result);
            } else {
                // Still failing
                $stillFailingDomains[] = $domain->id;
                
                // Get error message if it's the last attempt
                if ($this->attempt >= $this->maxAttempts - 1) {
                    $statusCode = null;
                    $errorMessage = null;
                    
                    if ($response instanceof \Illuminate\Http\Client\Response) {
                        $statusCode = $response->status();
                        $errorMessage = "HTTP Error " . $statusCode;
                    } elseif ($response instanceof \Exception) {
                        $errorMessage = $response->getMessage();
                    } else {
                        $errorMessage = "Unknown connection error";
                    }
                    
                    // Final confirmation that site is DOWN
                    $result = new MonitoringResult(false, (int)$durationMs, $statusCode, $errorMessage);
                    $monitoringService->recordResult($domain, $result);
                }
            }
        }
        
        // 3. Fast-retry again if not at max attempts
        if (!empty($stillFailingDomains) && $this->attempt < $this->maxAttempts - 1) {
            self::dispatch($stillFailingDomains, $this->attempt + 1)
                ->onQueue('monitoring')
                ->delay(now()->addSeconds(5));
        }
    }
}
