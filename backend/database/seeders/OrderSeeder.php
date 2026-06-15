<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\Sku;
use App\Models\Tenant;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'alpha')->first();
        app()->instance('tenant', $tenant);

        $faker = Faker::create();
        $buyers = User::whereHas('roles', function ($query) {
            $query->where('slug', 'buyer');
        })->where('tenant_id', $tenant->id)->get();

        $skus = Sku::where('tenant_id', $tenant->id)->with('product')->get();

        if ($buyers->isEmpty() || $skus->isEmpty()) {
            $this->command->warn('No buyers or SKUs found. Cannot seed orders.');
            return;
        }

        // Target: 1000 Orders
        for ($i = 0; $i < 1000; $i++) {
            $buyer = $buyers->random();
            
            $order = Order::create([
                'tenant_id'              => $tenant->id,
                'user_id'                => $buyer->id,
                'order_number'           => 'ORD-' . strtoupper(Str::random(10)),
                'idempotency_key'        => Str::uuid(),
                'status'                 => $faker->randomElement(['pending', 'paid', 'shipped', 'delivered']),
                'subtotal'               => 0, // Calculated below
                'tax'                    => 0,
                'shipping'               => $faker->randomFloat(2, 5, 25),
                'discount'               => 0,
                'total'                  => 0,
                'shipping_address'       => [
                    'address' => $faker->streetAddress,
                    'city'    => $faker->city,
                    'country' => $faker->country,
                ],
                'billing_address'        => [
                    'address' => $faker->streetAddress,
                    'city'    => $faker->city,
                    'country' => $faker->country,
                ],
                'currency_code'          => 'USD',
                'exchange_rate_snapshot' => 1.000000,
                'region_code'            => 'US',
                'notes'                  => null,
                'paid_at'                => $faker->dateTimeThisYear,
            ]);

            $numItems = rand(1, 4);
            $subtotal = 0;

            for ($j = 0; $j < $numItems; $j++) {
                $sku = $skus->random();
                $quantity = rand(1, 3);
                $lineTotal = $sku->price * $quantity;
                $subtotal += $lineTotal;

                OrderItem::create([
                    'order_id'          => $order->id,
                    'sku_id'            => $sku->id,
                    'seller_profile_id' => $sku->product->seller_profile_id,
                    'product_name'      => $sku->product->name,
                    'sku_code'          => $sku->sku_code,
                    'quantity'          => $quantity,
                    'unit_price'        => $sku->price,
                    'total'             => $lineTotal,
                ]);
            }

            $order->update([
                'subtotal' => $subtotal,
                'total'    => $subtotal + $order->shipping,
            ]);
        }

        app()->instance('tenant', null);
    }
}
