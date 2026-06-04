<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Inventory reservations — holds stock during checkout saga.
     *
     * Created by InventoryService::reserve() when the OrderSagaOrchestrator starts.
     * Released by InventoryService::release() on payment failure or order cancellation.
     * Consumed by InventoryService::commit() on payment success.
     */
    public function up(): void
    {
        Schema::create('inventory_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->string('order_saga_id', 100)->index(); // Saga correlation ID
            $table->unsignedInteger('quantity');
            $table->enum('status', ['reserved', 'committed', 'released'])->default('reserved');
            $table->timestamp('expires_at');               // 15-minute TTL for checkout sessions
            $table->timestamps();

            $table->index(['product_id', 'status']);
            $table->index(['order_saga_id']);
            $table->index(['expires_at']);                 // For cron expiry cleanup
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_reservations');
    }
};
