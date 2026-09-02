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
    public function performHttpCheck(DomainUrl $domain, int $timeout = 10): MonitoringResult
    {
        $start = microtime(true);
        $isUp = false;
        $httpStatusCode = null;
        $errorMessage = null;
        
        try {
            $response = Http::timeout($timeout)->get($domain->url);
            $httpStatusCode = $response->status();
            $isUp = $response->successful();
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();
            Log::error("Health check failed for {$domain->url}: " . $errorMessage);
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

            // Confirm DOWN if threshold met and wasn't already down
            if ($domain->consecutive_failures >= 3 && $domain->current_status !== 'down') {
                return 'down';
            }
        } else {
            $domain->consecutive_successes++;
            $domain->consecutive_failures = 0;

            // Confirm UP if threshold met and was down
            if ($domain->consecutive_successes >= 2 && $domain->current_status === 'down') {
                return 'recovered';
            }
        }

        return null;
    }
}
