<?php

namespace App\Jobs;

use App\Models\DomainUrl;
use App\Models\MonitoringLog;
use App\Services\MonitoringService;
use App\Services\NotificationDispatcher;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckDomainJob implements ShouldQueue, ShouldBeUnique
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $domainId;

    public $tries = 1;
    public $timeout = 30;

    /**
     * The unique ID of the job (prevents duplicate jobs for the same domain).
     */
    public function uniqueId(): string
    {
        return (string) $this->domainId;
    }

    /**
     * Create a new job instance.
     */
    public function __construct(int $domainId)
    {
        $this->domainId = $domainId;
    }

    /**
     * Execute the job.
     */
    public function handle(MonitoringService $monitoringService): void
    {
        $domain = DomainUrl::find($this->domainId);
        
        if (!$domain || $domain->status !== 'enabled') {
            return;
        }

        // 1. Perform HTTP Check
        $result = $monitoringService->performHttpCheck($domain);

        // 2. Record Monitoring Log
        MonitoringLog::create([
            'domain_url_id' => $domain->id,
            'user_id' => $domain->user_id,
            'is_up' => $result->isUp,
            'response_time_ms' => $result->responseTimeMs,
            'http_status_code' => $result->httpStatusCode,
            'error_message' => $result->errorMessage,
            'checked_at' => now(),
        ]);

        // 3. State Evaluation
        $stateChange = $monitoringService->evaluateState($domain, $result);

        // 4. Handle State Transitions
        if ($stateChange === 'down') {
            $domain->current_status = 'down';
            $domain->down_since = now();
            $domain->last_status_change_at = now();
            NotificationDispatcher::dispatch($domain, 'domain_down');
        } elseif ($stateChange === 'recovered') {
            $domain->current_status = 'up';
            $domain->down_since = null;
            $domain->last_status_change_at = now();
            NotificationDispatcher::dispatch($domain, 'domain_recovered');
        } elseif ($domain->current_status === 'unknown') {
            // First time check - only set to UP immediately if it's up.
            // If it's down, we leave it as 'unknown' so the 3-failure threshold logic will trigger a proper 'down' state change later.
            if ($result->isUp) {
                $domain->current_status = 'up';
            }
        }

        // 5. Update Domain Statistics
        $domain->domain_status = $result->isUp;
        $domain->response_time = $result->responseTimeMs;
        $domain->last_checked = now();
        $domain->scheduleNextCheck();
        $domain->save();
    }
}
