<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Models\Payout;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Payout\PayoutService;
use Tests\VeloraTestCase;

class PayoutServiceTest extends VeloraTestCase
{
    private PayoutService $service;
    private Tenant $tenant;
    private User $seller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(PayoutService::class);
        $this->tenant = $this->tenantA;
        $this->seller = $this->sellerUserA;
    }

    /** @test */
    public function it_creates_payout_request(): void
    {
        $payout = $this->service->createPayout(
            seller: $this->seller,
            amount: 500.00,
            tenant: $this->tenant,
        );

        $this->assertInstanceOf(Payout::class, $payout);
        $this->assertEquals(500.00, $payout->amount);
        $this->assertEquals('pending', $payout->status);
    }

    /** @test */
    public function it_processes_payout(): void
    {
        $payout = Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['status' => 'pending', 'amount' => 500.00]);

        $processed = $this->service->process($payout, $this->tenant);

        $this->assertEquals('processing', $processed->status);
    }

    /** @test */
    public function it_completes_payout(): void
    {
        $payout = Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['status' => 'processing']);

        $completed = $this->service->complete($payout, $this->tenant);

        $this->assertEquals('completed', $completed->status);
        $this->assertNotNull($completed->completed_at);
    }

    /** @test */
    public function it_marks_payout_as_failed(): void
    {
        $payout = Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['status' => 'processing']);

        $failed = $this->service->fail($payout, 'Bank transfer failed', $this->tenant);

        $this->assertEquals('failed', $failed->status);
        $this->assertEquals('Bank transfer failed', $failed->failure_reason);
    }

    /** @test */
    public function it_calculates_seller_pending_payout(): void
    {
        Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['amount' => 200.00, 'status' => 'pending']);

        Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['amount' => 300.00, 'status' => 'completed']);

        $pending = $this->service->getPendingAmount($this->seller, $this->tenant);

        $this->assertEquals(200.00, $pending);
    }

    /** @test */
    public function it_calculates_total_seller_payout(): void
    {
        Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['amount' => 100.00, 'status' => 'completed']);

        Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['amount' => 200.00, 'status' => 'completed']);

        $total = $this->service->getTotalPayout($this->seller, $this->tenant);

        $this->assertEquals(300.00, $total);
    }

    /** @test */
    public function it_prevents_payout_for_zero_amount(): void
    {
        $this->expectException(\RuntimeException::class);

        $this->service->createPayout(
            seller: $this->seller,
            amount: 0,
            tenant: $this->tenant,
        );
    }

    /** @test */
    public function it_prevents_payout_for_negative_amount(): void
    {
        $this->expectException(\RuntimeException::class);

        $this->service->createPayout(
            seller: $this->seller,
            amount: -50.00,
            tenant: $this->tenant,
        );
    }

    /** @test */
    public function it_returns_payouts_for_seller(): void
    {
        Payout::factory(5)
            ->for($this->tenant)
            ->for($this->seller)
            ->create();

        $payouts = $this->service->getPayouts($this->seller, $this->tenant);

        $this->assertGreaterThanOrEqual(5, $payouts->count());
    }

    /** @test */
    public function it_retries_failed_payout(): void
    {
        $payout = Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['status' => 'failed']);

        $retried = $this->service->retry($payout, $this->tenant);

        $this->assertIn($retried->status, ['pending', 'processing']);
        $this->assertEquals(2, $retried->retry_count ?? 1);
    }

    /** @test */
    public function it_respects_payout_minimum_amount(): void
    {
        $this->expectException(\RuntimeException::class);

        // Assuming minimum payout is configured
        $this->service->createPayout(
            seller: $this->seller,
            amount: 0.10,  // Very small amount
            tenant: $this->tenant,
        );
    }

    /** @test */
    public function it_respects_tenant_isolation(): void
    {
        $otherTenant = Tenant::factory()->create();

        $payout = Payout::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create();

        $this->expectException(\Exception::class);
        $this->service->process($payout, $otherTenant);
    }
}
