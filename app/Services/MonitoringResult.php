<?php

namespace App\Services;

class MonitoringResult
{
    public bool $isUp;
    public int $responseTimeMs;
    public ?int $httpStatusCode;
    public ?string $errorMessage;

    public function __construct(bool $isUp, int $responseTimeMs, ?int $httpStatusCode = null, ?string $errorMessage = null)
    {
        $this->isUp = $isUp;
        $this->responseTimeMs = $responseTimeMs;
        $this->httpStatusCode = $httpStatusCode;
        $this->errorMessage = $errorMessage;
    }
}
