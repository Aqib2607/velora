<?php

namespace Tests\Unit;

use App\Models\Inventory;
use App\Models\InventoryReservation;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Inventory\InventoryService;
use Tests\VeloraTestCase;

class InventoryServiceTest extends VeloraTestCase
{
    private InventoryService $service;
    private Tenant $tenant;
    private User $seller;
    private Product $product;
    private Inventory $inventory;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(InventoryService::class);
        $this->tenant = $this->tenantA;
        $this->seller = $this->sellerUserA;

        $this->product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create();

        $this->inventory = Inventory::factory()
            ->for($this->tenant)
            ->for($this->product)
            ->create(['quantity' => 100]);
    }

    /** @test */
    public function it_reserves_inventory_temporarily(): void
    {
        $quantity = 10;

        $reservation = $this->service->reserve($this->product, $quantity, $this->tenant);

        $this->assertInstanceOf(InventoryReservation::class, $reservation);
        $this->assertEquals($quantity, $reservation->quantity);
        $this->assertNotNull($reservation->expires_at);
    }

    /** @test */
    public function it_confirms_reservation_and_reduces_available_quantity(): void
    {
        $initialQuantity = $this->inventory->quantity;
        $reserveQuantity = 10;

        $reservation = $this->service->reserve($this->product, $reserveQuantity, $this->tenant);
        $this->service->confirmReservation($reservation, $this->tenant);

        $this->inventory->refresh();
        $this->assertEquals($initialQuantity - $reserveQuantity, $this->inventory->quantity);
    }

    /** @test */
    public function it_releases_expired_reservations(): void
    {
        $reservation = $this->service->reserve($this->product, 10, $this->tenant);
        $reservation->update(['expires_at' => now()->subMinute()]);

        $released = $this->service->releaseExpiredReservations($this->tenant);

        $this->assertGreaterThanOrEqual(1, $released);
        $reservation->refresh();
        $this->assertEquals('released', $reservation->status);
    }

    /** @test */
    public function it_cancels_reservation(): void
    {
        $reservation = $this->service->reserve($this->product, 10, $this->tenant);

        $this->service->cancelReservation($reservation, $this->tenant);

        $reservation->refresh();
        $this->assertEquals('cancelled', $reservation->status);
    }

    /** @test */
    public function it_throws_exception_when_insufficient_inventory(): void
    {
        $this->expectException(\RuntimeException::class);

        $this->service->reserve($this->product, 200, $this->tenant);  // Only 100 available
    }

    /** @test */
    public function it_returns_available_quantity(): void
    {
        $this->service->reserve($this->product, 10, $this->tenant);
        $this->service->reserve($this->product, 5, $this->tenant);

        $available = $this->service->getAvailableQuantity($this->product, $this->tenant);

        // 100 - 10 - 5 = 85
        $this->assertEquals(85, $available);
    }

    /** @test */
    public function it_tracks_inventory_changes(): void
    {
        $this->service->reserve($this->product, 10, $this->tenant);
        $this->inventory->refresh();

        $history = $this->service->getInventoryHistory($this->product, $this->tenant);

        $this->assertGreaterThanOrEqual(1, $history->count());
    }

    /** @test */
    public function it_handles_multiple_reservations_for_same_product(): void
    {
        $res1 = $this->service->reserve($this->product, 10, $this->tenant);
        $res2 = $this->service->reserve($this->product, 15, $this->tenant);
        $res3 = $this->service->reserve($this->product, 20, $this->tenant);

        $this->assertNotNull($res1);
        $this->assertNotNull($res2);
        $this->assertNotNull($res3);

        $available = $this->service->getAvailableQuantity($this->product, $this->tenant);
        $this->assertEquals(55, $available);  // 100 - 10 - 15 - 20
    }

    /** @test */
    public function it_returns_zero_for_nonexistent_product(): void
    {
        $fake = Product::factory()->make();
        $available = $this->service->getAvailableQuantity($fake, $this->tenant);

        $this->assertEquals(0, $available);
    }

    /** @test */
    public function it_validates_quantity_is_positive(): void
    {
        $this->expectException(\InvalidArgumentException::class);

        $this->service->reserve($this->product, -5, $this->tenant);
    }

    /** @test */
    public function it_respects_tenant_isolation(): void
    {
        $otherTenant = Tenant::factory()->create();
        $reservation = $this->service->reserve($this->product, 10, $this->tenant);

        // Trying to confirm from another tenant should fail
        $this->expectException(\Exception::class);
        $this->service->confirmReservation($reservation, $otherTenant);
    }
}
