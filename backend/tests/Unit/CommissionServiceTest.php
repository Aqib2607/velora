<?php

namespace Tests\Unit;

use App\Models\Commission\CommissionRule;
use App\Models\Commission\CommissionRecord;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Commission\CommissionService;
use Tests\VeloraTestCase;

class CommissionServiceTest extends VeloraTestCase
{
    private CommissionService $service;
    private Tenant $tenant;
    private User $seller;
    private Product $product;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(CommissionService::class);
        $this->tenant = $this->tenantA;
        $this->seller = $this->sellerUserA;

        $this->product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['base_price' => 100.00]);
    }

    /** @test */
    public function it_calculates_percentage_commission_correctly(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create([
                'type'       => 'percentage',
                'rate'       => 10,  // 10%
                'min_amount' => null,
                'max_amount' => null,
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 100.00, $this->tenant);

        $this->assertEquals(10.00, $commission);
    }

    /** @test */
    public function it_calculates_fixed_commission_correctly(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create([
                'type'       => 'fixed',
                'rate'       => 5.00,  // Fixed 5
                'min_amount' => null,
                'max_amount' => null,
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 100.00, $this->tenant);

        $this->assertEquals(5.00, $commission);
    }

    /** @test */
    public function it_respects_minimum_commission_amount(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create([
                'type'       => 'percentage',
                'rate'       => 5,     // 5%
                'min_amount' => 10.00,  // Min 10
                'max_amount' => null,
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 50.00, $this->tenant);

        $this->assertEquals(10.00, $commission);  // 5% of 50 = 2.50, but min is 10
    }

    /** @test */
    public function it_respects_maximum_commission_amount(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create([
                'type'       => 'percentage',
                'rate'       => 20,     // 20%
                'min_amount' => null,
                'max_amount' => 25.00,  // Max 25
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 200.00, $this->tenant);

        $this->assertEquals(25.00, $commission);  // 20% of 200 = 40, but max is 25
    }

    /** @test */
    public function it_uses_category_rule_if_no_seller_rule_exists(): void
    {
        $category = $this->product->category;

        CommissionRule::factory()
            ->for($this->tenant)
            ->for($category)
            ->create([
                'type'       => 'percentage',
                'rate'       => 15,
                'min_amount' => null,
                'max_amount' => null,
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 100.00, $this->tenant);

        $this->assertEquals(15.00, $commission);
    }

    /** @test */
    public function it_uses_seller_rule_over_category_rule(): void
    {
        $category = $this->product->category;

        CommissionRule::factory()
            ->for($this->tenant)
            ->for($category)
            ->create([
                'type'       => 'percentage',
                'rate'       => 15,
                'min_amount' => null,
                'max_amount' => null,
            ]);

        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create([
                'type'       => 'percentage',
                'rate'       => 8,  // Lower seller rule
                'min_amount' => null,
                'max_amount' => null,
            ]);

        $commission = $this->service->calculate($this->seller, $this->product, 100.00, $this->tenant);

        $this->assertEquals(8.00, $commission);  // Uses seller rule
    }

    /** @test */
    public function it_records_commission_correctly(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['type' => 'percentage', 'rate' => 10]);

        $record = $this->service->record(
            seller: $this->seller,
            orderId: 'order-123',
            orderAmount: 100.00,
            commissionAmount: 10.00,
            tenant: $this->tenant,
        );

        $this->assertInstanceOf(CommissionRecord::class, $record);
        $this->assertEquals('order-123', $record->order_id);
        $this->assertEquals(10.00, $record->commission_amount);
        $this->assertEquals('pending', $record->status);
    }

    /** @test */
    public function it_returns_zero_commission_when_no_rule_exists(): void
    {
        $commission = $this->service->calculate($this->seller, $this->product, 100.00, $this->tenant);

        $this->assertEquals(0.00, $commission);
    }

    /** @test */
    public function it_handles_zero_order_amount(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['type' => 'percentage', 'rate' => 10]);

        $commission = $this->service->calculate($this->seller, $this->product, 0, $this->tenant);

        $this->assertEquals(0.00, $commission);
    }

    /** @test */
    public function it_calculates_commission_for_multiple_items(): void
    {
        CommissionRule::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['type' => 'percentage', 'rate' => 10]);

        $totalAmount = 0;
        $totalCommission = 0;

        for ($i = 0; $i < 5; $i++) {
            $amount = 50.00;
            $commission = $this->service->calculate($this->seller, $this->product, $amount, $this->tenant);
            $totalAmount += $amount;
            $totalCommission += $commission;
        }

        $this->assertEquals(250.00, $totalAmount);
        $this->assertEquals(25.00, $totalCommission);
    }

    /** @test */
    public function it_returns_commission_records_for_seller(): void
    {
        for ($i = 0; $i < 3; $i++) {
            CommissionRecord::factory()
                ->for($this->tenant)
                ->for($this->seller)
                ->create(['commission_amount' => 10.00]);
        }

        $records = $this->service->getRecords($this->seller, $this->tenant);

        $this->assertCount(3, $records);
        $this->assertTrue($records->every(fn($r) => $r->seller_id === $this->seller->id));
    }

    /** @test */
    public function it_calculates_total_pending_commissions(): void
    {
        CommissionRecord::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['commission_amount' => 10.00, 'status' => 'pending']);

        CommissionRecord::factory()
            ->for($this->tenant)
            ->for($this->seller)
            ->create(['commission_amount' => 5.00, 'status' => 'paid']);

        $total = $this->service->getTotalPending($this->seller, $this->tenant);

        $this->assertEquals(10.00, $total);
    }
}
