<?php

namespace Tests\Feature;

use App\Models\Commission;
use App\Models\Order;
use App\Models\Payout;
use App\Models\SellerProfile;
use Tests\VeloraTestCase;

class CompletePayoutJourneyTest extends VeloraTestCase
{
    private SellerProfile $sellerProfile;

    protected function setUp(): void
    {
        parent::setUp();

        $this->sellerProfile = SellerProfile::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create([
                'bank_account_id' => 'acct_test_123',
                'status'          => 'verified',
            ]);
    }

    /** @test */
    public function seller_can_view_pending_payouts(): void
    {
        Payout::factory(3)
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'pending']);

        $headers = $this->headersForTenantA($this->sellerUserA);

        $response = $this->get('/v1/seller/payouts', $headers);

        $response->assertStatus(200);
        $payouts = $response->json('data');
        $this->assertCount(3, $payouts);
    }

    /** @test */
    public function admin_can_process_seller_payouts(): void
    {
        $payout = Payout::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'pending', 'amount' => 500.00]);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/payouts/{$payout->id}/process", [], $headers);

        $response->assertStatus(200);
        $processed = $response->json('data');
        $this->assertEquals('processing', $processed['status']);
    }

    /** @test */
    public function payout_can_be_completed(): void
    {
        $payout = Payout::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'processing']);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/payouts/{$payout->id}/complete", [], $headers);

        $response->assertStatus(200);
        $completed = $response->json('data');
        $this->assertEquals('completed', $completed['status']);
    }

    /** @test */
    public function payout_failure_is_tracked(): void
    {
        $payout = Payout::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'processing']);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/payouts/{$payout->id}/fail", [
            'reason' => 'Invalid bank account',
        ], $headers);

        $response->assertStatus(200);
        $failed = $response->json('data');
        $this->assertEquals('failed', $failed['status']);
        $this->assertEquals('Invalid bank account', $failed['failure_reason']);
    }

    /** @test */
    public function seller_can_view_payout_history(): void
    {
        Payout::factory(2)
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'completed']);

        Payout::factory(1)
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'pending']);

        $headers = $this->headersForTenantA($this->sellerUserA);

        $response = $this->get('/v1/seller/payouts?status=completed', $headers);

        $response->assertStatus(200);
        $payouts = $response->json('data');
        $this->assertCount(2, $payouts);
    }

    /** @test */
    public function seller_can_view_total_earnings(): void
    {
        Payout::factory(3)
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'completed', 'amount' => 100.00]);

        Payout::factory(1)
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'pending', 'amount' => 50.00]);

        $headers = $this->headersForTenantA($this->sellerUserA);

        $response = $this->get('/v1/seller/earnings', $headers);

        $response->assertStatus(200);
        $earnings = $response->json('data');

        $this->assertArrayHasKey('completed', $earnings);
        $this->assertArrayHasKey('pending', $earnings);
        $this->assertEquals(300.00, $earnings['completed']);
        $this->assertEquals(50.00, $earnings['pending']);
    }

    /** @test */
    public function failed_payout_can_be_retried(): void
    {
        $payout = Payout::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA)
            ->create(['status' => 'failed', 'retry_count' => 0]);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/payouts/{$payout->id}/retry", [], $headers);

        $response->assertStatus(200);
        $retried = $response->json('data');
        $this->assertIn($retried['status'], ['pending', 'processing']);
    }
}
