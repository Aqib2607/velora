<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        return [
            'tenant_id'         => Tenant::factory(),
            'seller_profile_id' => 1, // Fallback, test should override or seed
            'category_id'       => null,
            'name'              => $name,
            'slug'              => Str::slug($name . '-' . Str::random(4)),
            'description'       => $this->faker->paragraph,
            'status'            => 'active',
            'attributes'        => [],
        ];
    }
}
