<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\DomainUrl;

class InitializeMonitoringSchedule extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'monitor:init';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Seed next_check_at for all enabled domains';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $domains = DomainUrl::where('status', 'enabled')->get();
        $this->info("Found {$domains->count()} enabled domains. Initializing schedule...");

        $now = now();
        $delaySeconds = 0;

        foreach ($domains as $domain) {
            // Check plan to set interval (Free Trial = 15min, Starter = 5min, Pro/Enterprise = 1min)
            $user = $domain->user;
            $interval = 900; // default 15min
            
            if ($user) {
                $sub = $user->subscriptions()->where('status', 'active')->first();
                if ($sub) {
                    if (str_contains(strtolower($sub->plan_name), 'starter')) {
                        $interval = 300; // 5min
                    } elseif (str_contains(strtolower($sub->plan_name), 'pro') || str_contains(strtolower($sub->plan_name), 'enterprise')) {
                        $interval = 60; // 1min
                    }
                }
            }
            
            $domain->check_interval = $interval;
            $domain->next_check_at = $now->copy()->addSeconds($delaySeconds);
            $domain->save();
            
            $delaySeconds += rand(2, 5); // Stagger to prevent thundering herd
        }
        
        $this->info("Successfully initialized schedule for all domains.");
    }
}
