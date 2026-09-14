<?php

namespace App\Services;

use App\Models\DomainUrl;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MonitoringService
{
    /**
     * Perform the raw HTTP check and return the result DTO.
     */
    public function performHttpCheck(DomainUrl $domain, int $timeout = 15): MonitoringResult
    {
        $start = microtime(true);
        $isUp = false;
        $httpStatusCode = null;
        $errorMessage = null;
        
        $maxAttempts = 3;
        $attempt = 0;
        
        while ($attempt < $maxAttempts) {
            $attempt++;
            
            // Reset state for this attempt
            $isUp = false;
            $httpStatusCode = null;
            $errorMessage = null;

            try {
                $response = Http::withoutVerifying()->timeout($timeout)->get($domain->url);
                $httpStatusCode = $response->status();
                $isUp = $response->successful();
                
                // If it's successful, we don't need to retry
                if ($isUp) {
                    break;
                }
            } catch (\Exception $e) {
                $errorMessage = $e->getMessage();
                // Log only if it's the final attempt to avoid log spam on quick recoveries
                if ($attempt === $maxAttempts) {
                    Log::warning("Health check failed for {$domain->url} after {$maxAttempts} attempts: " . $errorMessage);
                }
            }
            
            // If we are here, it failed. Wait before retrying (unless it's the last attempt)
            if ($attempt < $maxAttempts && !$isUp) {
                sleep(5);
            }
        }

        $durationMs = round((microtime(true) - $start) * 1000);

        return new MonitoringResult($isUp, (int)$durationMs, $httpStatusCode, $errorMessage);
    }

    /**
     * Evaluate the new state against the old state using thresholds.
     * Returns 'down', 'recovered', or null if no state change is confirmed.
     */
    public function evaluateState(DomainUrl $domain, MonitoringResult $result): ?string
    {
        if (!$result->isUp) {
            $domain->consecutive_failures++;
            $domain->consecutive_successes = 0;

            // Confirm DOWN immediately if wasn't already down, since we already did 3 fast-retries
            if ($domain->current_status !== 'down') {
                return 'down';
            }
        } else {
            $domain->consecutive_successes++;
            $domain->consecutive_failures = 0;

            // Confirm UP immediately if was down
            if ($domain->current_status === 'down') {
                return 'recovered';
            }
        }

        return null;
    }

    /**
     * Record a monitoring result and handle state transitions.
     * This replaces the logic that was inside CheckDomainJob's handle method.
     */
    public function recordResult(DomainUrl $domain, MonitoringResult $result): void
    {
        // 1. Record Monitoring Log
        \App\Models\MonitoringLog::create([
            'domain_url_id' => $domain->id,
            'user_id' => $domain->user_id,
            'is_up' => $result->isUp,
            'response_time_ms' => $result->responseTimeMs,
            'http_status_code' => $result->httpStatusCode,
            'error_message' => $result->errorMessage,
            'checked_at' => now(),
        ]);

        // 2. State Evaluation
        $stateChange = $this->evaluateState($domain, $result);

        // 3. Handle State Transitions
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
            if ($result->isUp) {
                $domain->current_status = 'up';
            }
        }

        // 4. Update Domain Statistics
        $domain->domain_status = $result->isUp;
        $domain->response_time = $result->responseTimeMs;
        $domain->last_checked = now();
        $domain->scheduleNextCheck();
        $domain->save();
    }
}
