<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Tenant;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'alpha')->first();
        app()->instance('tenant', $tenant);

        $faker = Faker::create();

        $categoryNames = [
            'Consumer Electronics', 'Luxury Apparel', 'Home & Living', 'Health & Beauty',
            'Automotive Accessories', 'Sports & Outdoors', 'Toys & Games', 'Books & Media',
            'Pet Supplies', 'Office & Stationery', 'Garden & Outdoor', 'Watches & Jewelry',
            'Baby Products', 'Musical Instruments', 'Industrial & Scientific',
            'Handmade Crafts', 'Groceries & Gourmet', 'Tools & Home Improvement',
            'Art & Collectibles', 'Software & Digital', 'Fitness Equipment',
            'Smart Home Devices', 'Vintage & Antique', 'Travel Accessories', 'Eco-Friendly Goods'
        ];

        foreach ($categoryNames as $index => $name) {
            $id = $index + 100; // Unique ID for Picsum
            Category::create([
                'tenant_id'   => $tenant->id,
                'name'        => $name,
                'slug'        => Str::slug($name),
                'description' => $faker->paragraph(2),
                'image'       => "https://picsum.photos/seed/{$id}/800/800",
                'is_active'   => true,
                'sort_order'  => $index,
            ]);
        }

        app()->instance('tenant', null);
    }
}
