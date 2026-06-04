<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_analytics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('query', 500);
            $table->unsignedInteger('result_count')->default(0);
            $table->foreignId('clicked_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->timestamp('clicked_at')->nullable();
            $table->string('session_id')->nullable();
            $table->timestamp('searched_at');
            $table->timestamps();

            $table->index(['tenant_id', 'searched_at']);
            $table->index(['query', 'tenant_id']);
            $table->index(['user_id', 'searched_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_analytics');
    }
};
