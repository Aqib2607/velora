<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Product;
use App\Models\Refund;
use Tests\VeloraTestCase;

class CompleteRefundJourneyTest extends VeloraTestCase
{
    private Order $order;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a paid order
        $this->order = Order::factory()
            ->for($this->tenantA)
            ->for($this->buyerA, 'customer')
            ->create([
                'status'        => 'delivered',
                'total_amount'  => 100.00,
                'payment_id'    => 'pi_test_123',
            ]);
    }

    /** @test */
    public function buyer_can_request_refund(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post("/v1/orders/{$this->order->id}/refund", [
            'amount' => 100.00,
            'reason' => 'Product defective',
        ], $headers);

        $response->assertStatus(201);
        $refund = $response->json('data');
        $this->assertEquals('pending', $refund['status']);
    }

    /** @test */
    public function admin_can_approve_refund(): void
    {
        $refund = Refund::factory()
            ->for($this->tenantA)
            ->for($this->order)
            ->create(['status' => 'pending']);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/refunds/{$refund->id}/approve", [], $headers);

        $response->assertStatus(200);
        $updated = $response->json('data');
        $this->assertEquals('approved', $updated['status']);
    }

    /** @test */
    public function admin_can_reject_refund(): void
    {
        $refund = Refund::factory()
            ->for($this->tenantA)
            ->for($this->order)
            ->create(['status' => 'pending']);

        $headers = $this->headersForTenantA($this->adminA);

        $response = $this->put("/v1/refunds/{$refund->id}/reject", [
            'reason' => 'Invalid reason',
        ], $headers);

        $response->assertStatus(200);
        $updated = $response->json('data');
        $this->assertEquals('rejected', $updated['status']);
    }

    /** @test */
    public function refund_triggers_payment_reversal(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post("/v1/orders/{$this->order->id}/refund", [
            'amount' => 50.00,
            'reason' => 'Partial return',
        ], $headers);

        $refund = $response->json('data');

        // Approve refund
        $approveHeaders = $this->headersForTenantA($this->adminA);
        $this->put("/v1/refunds/{$refund['id']}/approve", [], $approveHeaders);

        // Process refund (should trigger payment reversal)
        $processResponse = $this->post("/v1/refunds/{$refund['id']}/process", [], $approveHeaders);
        $processResponse->assertStatus(200);

        $processed = $processResponse->json('data');
        $this->assertEquals('processed', $processed['status']);
    }

    /** @test */
    public function buyer_cannot_refund_more_than_order_total(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post("/v1/orders/{$this->order->id}/refund", [
            'amount' => 150.00,  // More than order total
            'reason' => 'Trying to get extra money',
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function buyer_can_track_refund_status(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $refund = Refund::factory()
            ->for($this->tenantA)
            ->for($this->order)
            ->create(['status' => 'approved']);

        $response = $this->get("/v1/refunds/{$refund->id}", $headers);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertEquals('approved', $data['status']);
    }

    /** @test */
    public function buyer_can_list_order_refunds(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        Refund::factory(3)
            ->for($this->tenantA)
            ->for($this->order)
            ->create();

        $response = $this->get("/v1/orders/{$this->order->id}/refunds", $headers);

        $response->assertStatus(200);
        $refunds = $response->json('data');
        $this->assertCount(3, $refunds);
    }
}
