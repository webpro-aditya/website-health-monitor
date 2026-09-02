<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('domain_urls', function (Blueprint $table) {
            $table->integer('check_interval')->default(300); // seconds
            $table->dateTime('next_check_at')->nullable()->index();
            $table->enum('current_status', ['unknown', 'up', 'down'])->default('unknown');
            $table->unsignedInteger('consecutive_failures')->default(0);
            $table->unsignedInteger('consecutive_successes')->default(0);
            $table->dateTime('last_status_change_at')->nullable();
            $table->dateTime('down_since')->nullable();
            $table->dateTime('last_notified_at')->nullable(); // For cooldown tracking
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('domain_urls', function (Blueprint $table) {
            $table->dropColumn([
                'check_interval',
                'next_check_at',
                'current_status',
                'consecutive_failures',
                'consecutive_successes',
                'last_status_change_at',
                'down_since',
                'last_notified_at',
            ]);
        });
    }
};
