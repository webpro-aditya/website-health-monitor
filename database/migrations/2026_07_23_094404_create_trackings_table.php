<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('trackings', function (Blueprint $table) {
            $table->id();
            $table->string('url', 250)->unique();
            $table->boolean('last_status')->default(false);
            $table->dateTime('last_checked');
            $table->integer('last_notified_status')->default(-1);
            $table->integer('response_time_ms')->nullable();
            $table->dateTime('down_since')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trackings');
    }
};
