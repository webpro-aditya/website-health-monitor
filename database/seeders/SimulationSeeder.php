<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Subscription;
use App\Models\DomainUrl;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SimulationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create 50 Dummy Users
        echo "Creating 50 dummy users...\n";
        $users = [];
        for ($i = 1; $i <= 50; $i++) {
            $user = User::create([
                'name' => "Dummy User {$i}",
                'email' => "dummy{$i}@example.com",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]);
            
            // Assign Enterprise plan so they have unlimited domains and 30s checks
            Subscription::create([
                'user_id' => $user->id,
                'plan_name' => env('RAZORPAY_PLAN_ENTERPRISE_MONTHLY'),
                'razorpay_customer_id' => 'cust_fake_' . Str::random(10),
                'razorpay_subscription_id' => 'sub_fake_' . Str::random(10),
                'status' => 'active',
            ]);
            
            $users[] = $user;
        }
        
        // 2. Create Domains (Mix of healthy and failing)
        echo "Creating 200 dummy domains...\n";
        
        $healthyUrls = [
            'https://google.com', 'https://cloudflare.com', 'https://github.com',
            'https://example.com', 'https://amazon.com', 'https://apple.com',
            'https://microsoft.com', 'https://yahoo.com', 'https://wikipedia.org'
        ];
        
        $domainCount = 0;
        
        foreach ($users as $index => $user) {
            // Give each user 4 domains
            for ($d = 1; $d <= 4; $d++) {
                $domainCount++;
                
                // Make ~25% of domains fail
                if ($domainCount % 4 === 0) {
                    $url = "http://this-is-a-fake-domain-that-will-fail-{$domainCount}.invalid";
                    $name = "Failing Site {$domainCount}";
                } else {
                    $url = $healthyUrls[array_rand($healthyUrls)];
                    $name = "Healthy Site {$domainCount}";
                }
                
                DomainUrl::create([
                    'user_id' => $user->id,
                    'domain_name' => $name,
                    'url' => $url,
                    'status' => 'enabled',
                    'check_interval' => 30, // 30s for enterprise
                    'next_check_at' => now()->subMinutes(5), // Make them all due immediately
                ]);
            }
        }
        
        echo "Seeding complete! Added 50 users and 200 domains.\n";
    }
}
