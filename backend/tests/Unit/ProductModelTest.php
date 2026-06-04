<?php

namespace Tests\Unit;

use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Validation\ValidationException;
use Tests\VeloraTestCase;

class ProductModelTest extends VeloraTestCase
{
    private Tenant $tenant;
    private User $seller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = $this->tenantA;
        $this->seller = $this->sellerUserA;
    }

    /** @test */
    public function it_validates_required_product_fields(): void
    {
        $this->expectException(ValidationException::class);

        Product::create([  // Missing required fields
            // name, description, price missing
        ]);
    }

    /** @test */
    public function it_creates_product_with_valid_data(): void
    {
        $product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create([
                'name' => 'Test Product',
                'base_price' => 99.99,
                'status' => 'active',
            ]);

        $this->assertEquals('Test Product', $product->name);
        $this->assertEquals(99.99, $product->base_price);
        $this->assertEquals('active', $product->status);
    }

    /** @test */
    public function it_enforces_unique_sku_per_tenant(): void
    {
        $sku = 'SKU-12345';

        Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['sku' => $sku]);

        $this->expectException(\Exception::class);

        Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['sku' => $sku]);
    }

    /** @test */
    public function it_allows_same_sku_in_different_tenants(): void
    {
        $sku = 'SKU-MULTI';
        $tenant2 = Tenant::factory()->create();

        $product1 = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['sku' => $sku]);

        $product2 = Product::factory()
            ->for($tenant2)
            ->for($this->seller, 'seller')
            ->create(['sku' => $sku]);

        $this->assertEquals($sku, $product1->sku);
        $this->assertEquals($sku, $product2->sku);
    }

    /** @test */
    public function it_enforces_positive_price(): void
    {
        $this->expectException(\Exception::class);

        Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['base_price' => -10]);
    }

    /** @test */
    public function it_has_inventory_relationship(): void
    {
        $product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->hasInventory(['quantity' => 50])
            ->create();

        $this->assertNotNull($product->inventory);
        $this->assertEquals(50, $product->inventory->quantity);
    }

    /** @test */
    public function it_has_seller_relationship(): void
    {
        $product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create();

        $this->assertNotNull($product->seller);
        $this->assertEquals($this->seller->id, $product->seller_id);
    }

    /** @test */
    public function it_soft_deletes_product(): void
    {
        $product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create();

        $id = $product->id;
        $product->delete();

        $this->assertSoftDeleted($product);
        $this->assertNull(Product::find($id));
        $this->assertNotNull(Product::withTrashed()->find($id));
    }

    /** @test */
    public function it_filters_by_status(): void
    {
        Product::factory(3)
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['status' => 'active']);

        Product::factory(2)
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['status' => 'draft']);

        $active = Product::where('status', 'active')
            ->where('tenant_id', $this->tenant->id)
            ->count();

        $this->assertEquals(3, $active);
    }

    /** @test */
    public function it_applies_seller_scope(): void
    {
        Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create();

        $otherSeller = User::factory()
            ->for($this->tenant)
            ->create(['role' => 'seller']);

        Product::factory()
            ->for($this->tenant)
            ->for($otherSeller, 'seller')
            ->create();

        $sellerProducts = $this->seller->products()->count();

        $this->assertEquals(1, $sellerProducts);
    }

    /** @test */
    public function it_applies_tenant_scope(): void
    {
        Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create();

        $otherTenant = Tenant::factory()->create();

        Product::factory()
            ->for($otherTenant)
            ->for($this->seller, 'seller')
            ->create();

        $tenantProducts = Product::where('tenant_id', $this->tenant->id)->count();

        $this->assertEquals(1, $tenantProducts);
    }

    /** @test */
    public function it_casts_price_to_decimal(): void
    {
        $product = Product::factory()
            ->for($this->tenant)
            ->for($this->seller, 'seller')
            ->create(['base_price' => 99.99]);

        $this->assertIsFloat($product->base_price);
        $this->assertEquals(99.99, $product->base_price);
    }
}
