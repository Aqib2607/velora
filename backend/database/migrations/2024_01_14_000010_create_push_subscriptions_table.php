<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('push_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('device_type', ['ios', 'android', 'web'])->default('web');
            $table->string('device_token', 500); // FCM or APNS token
            $table->string('endpoint')->nullable(); // Web push endpoint
            $table->string('auth_key')->nullable(); // Web push auth key
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'device_token']);
            $table->index(['user_id', 'is_active']);
            $table->index(['device_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('push_subscriptions');
    }
};
