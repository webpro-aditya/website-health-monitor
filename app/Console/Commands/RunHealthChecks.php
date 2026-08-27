<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\MonitoringService;

class RunHealthChecks extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'monitor:run';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run health checks for all enabled domains';

    /**
     * Execute the console command.
     */
    public function handle(MonitoringService $monitoringService)
    {
        $this->info('Starting health checks...');
        $monitoringService->checkDomains();
        $this->info('Health checks completed.');
    }
}
