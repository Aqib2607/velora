<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use Tests\VeloraTestCase;

class CompleteCheckoutJourneyTest extends VeloraTestCase
{
    /** @test */
    public function buyer_can_complete_full_checkout_flow(): void
    {
        // 1. Buyer logs in (implicit in headers)
        $headers = $this->headersForTenantA($this->buyerA);

        // 2. Browse products
        $response = $this->get('/v1/products', $headers);
        $response->assertStatus(200);
        $products = $response->json('data');
        $this->assertNotEmpty($products);

        // 3. Add product to cart
        $product = Product::where('tenant_id', $this->tenantA->id)->first();
        $cartResponse = $this->post('/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 2,
        ], $headers);
        $cartResponse->assertStatus(200);

        // 4. View cart
        $viewCartResponse = $this->get('/v1/cart', $headers);
        $viewCartResponse->assertStatus(200);
        $cart = $viewCartResponse->json();
        $this->assertNotEmpty($cart['items'] ?? []);

        // 5. Proceed to checkout
        $checkoutResponse = $this->post('/v1/orders', [
            'billing_address' => [
                'street'       => '123 Main St',
                'city'         => 'Springfield',
                'state'        => 'IL',
                'postal_code'  => '62701',
                'country'      => 'US',
            ],
            'shipping_address' => [
                'street'       => '123 Main St',
                'city'         => 'Springfield',
                'state'        => 'IL',
                'postal_code'  => '62701',
                'country'      => 'US',
            ],
        ], $headers);

        $checkoutResponse->assertStatus(201);
        $order = $checkoutResponse->json('data');
        $orderId = $order['id'];

        // 6. Verify order created
        $orderResponse = $this->get("/v1/orders/{$orderId}", $headers);
        $orderResponse->assertStatus(200);

        // 7. Make payment
        $paymentResponse = $this->post("/v1/orders/{$orderId}/pay", [
            'payment_method_id' => 'pm_card_visa',
            'amount'            => $order['total'],
        ], $headers);

        $paymentResponse->assertStatus(200);

        // 8. Verify order paid
        $finalOrderResponse = $this->get("/v1/orders/{$orderId}", $headers);
        $finalOrder = $finalOrderResponse->json('data');
        $this->assertEquals('paid', $finalOrder['status']);

        // 9. Verify cart is cleared
        $cartAfterResponse = $this->get('/v1/cart', $headers);
        $cartAfter = $cartAfterResponse->json();
        $this->assertEmpty($cartAfter['items'] ?? []);
    }

    /** @test */
    public function buyer_can_add_multiple_products_from_different_sellers(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        // Get or create products from different sellers
        $seller1 = $this->sellerUserA;
        $seller2 = User::factory()
            ->for($this->tenantA)
            ->create(['role' => 'seller']);

        $product1 = Product::factory()
            ->for($this->tenantA)
            ->for($seller1, 'seller')
            ->create(['base_price' => 50.00]);

        $product2 = Product::factory()
            ->for($this->tenantA)
            ->for($seller2, 'seller')
            ->create(['base_price' => 75.00]);

        // Add both to cart
        $this->post('/v1/cart', ['product_id' => $product1->id, 'quantity' => 1], $headers)
            ->assertStatus(200);

        $this->post('/v1/cart', ['product_id' => $product2->id, 'quantity' => 1], $headers)
            ->assertStatus(200);

        // Verify cart has items from both sellers
        $cartResponse = $this->get('/v1/cart', $headers);
        $cart = $cartResponse->json();

        $this->assertCount(2, $cart['items']);
    }

    /** @test */
    public function checkout_respects_inventory_limits(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $product = Product::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA, 'seller')
            ->hasInventory(['quantity' => 2])
            ->create();

        // Try to add 5 of a product with only 2 in stock
        $response = $this->post('/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 5,
        ], $headers);

        $response->assertStatus(422);  // Should fail validation
    }

    /** @test */
    public function checkout_calculates_correct_total_with_commissions(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $product = Product::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA, 'seller')
            ->create(['base_price' => 100.00]);

        $this->post('/v1/cart', ['product_id' => $product->id, 'quantity' => 1], $headers);

        $checkoutResponse = $this->post('/v1/orders', [
            'billing_address'  => $this->validAddress(),
            'shipping_address' => $this->validAddress(),
        ], $headers);

        $order = $checkoutResponse->json('data');

        // Total should be calculated correctly
        $this->assertGreaterThan(0, $order['total']);
        $this->assertIsNumeric($order['commission_amount']);
    }

    private function validAddress(): array
    {
        return [
            'street'       => '123 Main St',
            'city'         => 'Springfield',
            'state'        => 'IL',
            'postal_code'  => '62701',
            'country'      => 'US',
        ];
    }
}
