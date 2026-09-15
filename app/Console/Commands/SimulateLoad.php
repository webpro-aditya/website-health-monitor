<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use App\Models\User;
use App\Models\DomainUrl;
use App\Models\MonitoringLog;
use App\Models\NotificationQueue;
use App\Models\Subscription;

class SimulateLoad extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'simulate:load';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean DB, seed dummy data, and dispatch health checks to simulate load.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Simulation...');

        // 1. Cleanup
        $this->info('Cleaning up old dummy data and queues...');
        Artisan::call('queue:clear', ['--queue' => 'monitoring']);
        Artisan::call('queue:clear', ['--queue' => 'emails']);
        Artisan::call('queue:clear', ['--queue' => 'default']);
        
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        MonitoringLog::truncate();
        NotificationQueue::truncate();
        
        // Delete all dummy users (and cascade domains/subscriptions)
        User::where('email', 'like', 'dummy%@example.com')->delete();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        
        // 2. Seed
        $this->info('Running SimulationSeeder...');
        Artisan::call('db:seed --class=SimulationSeeder');
        $this->info(Artisan::output());
        
        // 3. Dispatch
        $this->info('Dispatching health checks for all due domains...');
        Artisan::call('monitor:dispatch');
        $this->info(Artisan::output());
        
        $this->info('Simulation setup complete! Please start your queue worker to observe the load:');
        $this->info('php artisan queue:work --queue=monitoring,emails,sms,default');
    }
}
