<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Refund;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Refund\RefundService;
use Tests\VeloraTestCase;

class RefundServiceTest extends VeloraTestCase
{
    private RefundService $service;
    private Tenant $tenant;
    private User $buyer;
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(RefundService::class);
        $this->tenant = $this->tenantA;
        $this->buyer = $this->buyerA;

        $this->order = Order::factory()
            ->for($this->tenant)
            ->for($this->buyer, 'customer')
            ->create([
                'status' => 'completed',
                'total_amount' => 100.00,
            ]);
    }

    /** @test */
    public function it_initiates_refund_request(): void
    {
        $refund = $this->service->initiate(
            order: $this->order,
            reason: 'Product defective',
            amount: 100.00,
            tenant: $this->tenant,
        );

        $this->assertInstanceOf(Refund::class, $refund);
        $this->assertEquals('pending', $refund->status);
        $this->assertEquals(100.00, $refund->amount);
        $this->assertEquals('Product defective', $refund->reason);
    }

    /** @test */
    public function it_approves_refund(): void
    {
        $refund = Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['status' => 'pending', 'amount' => 100.00]);

        $approved = $this->service->approve($refund, $this->tenant);

        $this->assertEquals('approved', $approved->status);
        $this->assertNotNull($approved->approved_at);
    }

    /** @test */
    public function it_rejects_refund(): void
    {
        $refund = Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['status' => 'pending']);

        $rejected = $this->service->reject($refund, 'Invalid reason', $this->tenant);

        $this->assertEquals('rejected', $rejected->status);
        $this->assertEquals('Invalid reason', $rejected->rejection_reason);
    }

    /** @test */
    public function it_processes_payment_refund(): void
    {
        $refund = Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['status' => 'approved', 'amount' => 50.00]);

        $processed = $this->service->process($refund, $this->tenant);

        $this->assertEquals('processed', $processed->status);
        $this->assertNotNull($processed->processed_at);
    }

    /** @test */
    public function it_prevents_refund_exceeding_order_total(): void
    {
        $this->expectException(\RuntimeException::class);

        $this->service->initiate(
            order: $this->order,
            reason: 'Too much',
            amount: 150.00,  // Exceeds order total of 100
            tenant: $this->tenant,
        );
    }

    /** @test */
    public function it_supports_partial_refund(): void
    {
        $refund1 = $this->service->initiate(
            order: $this->order,
            reason: 'Partial return',
            amount: 30.00,
            tenant: $this->tenant,
        );

        $refund2 = $this->service->initiate(
            order: $this->order,
            reason: 'Another partial',
            amount: 40.00,
            tenant: $this->tenant,
        );

        $this->assertEquals(30.00, $refund1->amount);
        $this->assertEquals(40.00, $refund2->amount);
    }

    /** @test */
    public function it_tracks_refund_status_history(): void
    {
        $refund = Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['status' => 'pending']);

        $this->service->approve($refund, $this->tenant);
        $this->service->process($refund, $this->tenant);

        $refund->refresh();
        $this->assertEquals('processed', $refund->status);
    }

    /** @test */
    public function it_returns_refunds_for_order(): void
    {
        Refund::factory(3)
            ->for($this->tenant)
            ->for($this->order)
            ->create();

        $refunds = $this->service->getRefundsForOrder($this->order, $this->tenant);

        $this->assertCount(3, $refunds);
    }

    /** @test */
    public function it_calculates_total_refunded_amount(): void
    {
        Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['amount' => 20.00, 'status' => 'processed']);

        Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['amount' => 30.00, 'status' => 'processed']);

        Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['amount' => 10.00, 'status' => 'pending']);

        $total = $this->service->getTotalRefunded($this->order, $this->tenant);

        $this->assertEquals(50.00, $total);  // Only processed refunds
    }

    /** @test */
    public function it_prevents_duplicate_full_refund(): void
    {
        Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['amount' => 100.00, 'status' => 'processed']);

        $this->expectException(\RuntimeException::class);

        $this->service->initiate(
            order: $this->order,
            reason: 'Another refund',
            amount: 100.00,
            tenant: $this->tenant,
        );
    }

    /** @test */
    public function it_respects_tenant_isolation(): void
    {
        $other = Tenant::factory()->create();

        $refund = Refund::factory()
            ->for($this->tenant)
            ->for($this->order)
            ->create(['status' => 'pending']);

        $this->expectException(\Exception::class);
        $this->service->approve($refund, $other);
    }
}
