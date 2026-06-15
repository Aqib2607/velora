<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\SellerProfile;
use App\Models\Sku;
use App\Models\Inventory;
use App\Models\Tenant;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'alpha')->first();
        app()->instance('tenant', $tenant);

        $faker = Faker::create();
        $categories = Category::where('tenant_id', $tenant->id)->get();
        $sellers = SellerProfile::where('tenant_id', $tenant->id)->get();

        if ($categories->isEmpty() || $sellers->isEmpty()) {
            $this->command->warn('No categories or sellers found. Run CategorySeeder and SellerSeeder first.');
            return;
        }

        // Target: 500 Products
        for ($i = 0; $i < 500; $i++) {
            $name = ucwords($faker->words(rand(2, 4), true));
            $seller = $sellers->random();
            $category = $categories->random();

            // Using JSON attributes to fulfill "rating" and "reviews" 500+ requirement
            $reviewCount = $faker->numberBetween(10, 1500);
            $rating = $faker->randomFloat(1, 3.5, 5.0);

            $product = Product::create([
                'tenant_id'         => $tenant->id,
                'seller_profile_id' => $seller->id,
                'category_id'       => $category->id,
                'name'              => $name,
                'slug'              => Str::slug($name) . '-' . Str::random(5),
                'description'       => $faker->paragraphs(3, true),
                'thumbnail'         => "https://picsum.photos/seed/" . ($i + 500) . "/800/800",
                'images'            => [
                    "https://picsum.photos/seed/" . ($i + 500) . "/800/800",
                    "https://picsum.photos/seed/" . ($i + 5000) . "/800/800"
                ],
                'status'            => 'active',
                'attributes'        => [
                    'brand'        => $faker->company,
                    'rating'       => $rating,
                    'reviewCount'  => $reviewCount,
                    'material'     => $faker->word,
                ]
            ]);

            $price = $faker->randomFloat(2, 10, 2000);
            
            $sku = Sku::create([
                'tenant_id'  => $tenant->id,
                'product_id' => $product->id,
                'sku_code'   => strtoupper(Str::random(10)),
                'price'      => $price,
                'is_active'  => true,
            ]);

            Inventory::create([
                'sku_id'             => $sku->id,
                'quantity_available' => $faker->numberBetween(10, 500),
                'quantity_reserved'  => 0,
                'quantity_sold'      => $faker->numberBetween(0, 100),
            ]);
        }

        app()->instance('tenant', null);
    }
}
