<?php

namespace Tests\Feature;

use App\Models\Order;
use Tests\VeloraTestCase;

class APIValidationTest extends VeloraTestCase
{
    /** @test */
    public function order_creation_validates_required_fields(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post('/v1/orders', [], $headers);

        $response->assertStatus(422);
        $errors = $response->json('errors');
        $this->assertArrayHasKey('billing_address', $errors);
        $this->assertArrayHasKey('shipping_address', $errors);
    }

    /** @test */
    public function payment_endpoint_validates_input(): void
    {
        $order = Order::factory()
            ->for($this->tenantA)
            ->for($this->buyerA, 'customer')
            ->create(['status' => 'pending']);

        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post("/v1/orders/{$order->id}/pay", [
            // Missing required fields
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function invalid_product_id_returns_404(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->get('/v1/products/99999', $headers);

        $response->assertStatus(404);
    }

    /** @test */
    public function negative_quantity_is_rejected(): void
    {
        $product = $this->createTestProduct();
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post('/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => -5,
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function zero_quantity_is_rejected(): void
    {
        $product = $this->createTestProduct();
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post('/v1/cart', [
            'product_id' => $product->id,
            'quantity'   => 0,
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function refund_reason_is_required(): void
    {
        $order = Order::factory()
            ->for($this->tenantA)
            ->for($this->buyerA, 'customer')
            ->create(['status' => 'delivered', 'total_amount' => 100]);

        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post("/v1/orders/{$order->id}/refund", [
            'amount' => 50.00,
            // reason missing
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function invalid_currency_code_is_rejected(): void
    {
        $headers = $this->headersForTenantA($this->buyerA);

        $response = $this->post('/v1/orders', [
            'currency'          => 'INVALID',
            'billing_address'   => $this->validAddress(),
            'shipping_address'  => $this->validAddress(),
        ], $headers);

        $response->assertStatus(422);
    }

    /** @test */
    public function email_validation_enforced_on_registration(): void
    {
        $response = $this->post('/v1/auth/register', [
            'name'     => 'Test User',
            'email'    => 'not-an-email',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422);
        $errors = $response->json('errors');
        $this->assertArrayHasKey('email', $errors);
    }

    /** @test */
    public function password_strength_is_validated(): void
    {
        $response = $this->post('/v1/auth/register', [
            'name'     => 'Test User',
            'email'    => 'test@example.com',
            'password' => '123',  // Too weak
        ]);

        $response->assertStatus(422);
    }

    /** @test */
    public function duplicate_email_is_rejected(): void
    {
        $this->post('/v1/auth/register', [
            'name'     => 'User 1',
            'email'    => 'duplicate@example.com',
            'password' => 'Password123!',
        ]);

        $response = $this->post('/v1/auth/register', [
            'name'     => 'User 2',
            'email'    => 'duplicate@example.com',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(422);
        $errors = $response->json('errors');
        $this->assertArrayHasKey('email', $errors);
    }

    /** @test */
    public function seller_product_price_must_be_positive(): void
    {
        $headers = $this->headersForTenantA($this->sellerUserA);

        $response = $this->post('/v1/products', [
            'name'       => 'Test Product',
            'base_price' => -50.00,
            'category_id' => 1,
        ], $headers);

        $response->assertStatus(422);
    }

    private function createTestProduct()
    {
        return \App\Models\Product::factory()
            ->for($this->tenantA)
            ->for($this->sellerUserA, 'seller')
            ->hasInventory(['quantity' => 100])
            ->create();
    }

    private function validAddress(): array
    {
        return [
            'street'      => '123 Main St',
            'city'        => 'Springfield',
            'state'       => 'IL',
            'postal_code' => '62701',
            'country'     => 'US',
        ];
    }
}
