<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('domain_urls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('domain_name');
            $table->string('url', 500);
            $table->enum('status', ['enabled', 'disabled'])->default('enabled');
            $table->boolean('domain_status')->default(false);
            $table->integer('response_time')->nullable();
            $table->dateTime('last_checked')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('domain_urls');
    }
};
