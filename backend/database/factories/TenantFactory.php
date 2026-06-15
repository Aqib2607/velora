<?php

namespace Database\Factories;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class TenantFactory extends Factory
{
    protected $model = Tenant::class;

    public function definition(): array
    {
        $name = $this->faker->company;
        return [
            'name'     => $name,
            'slug'     => Str::slug($name . '-' . Str::random(4)),
            'domain'   => Str::slug($name) . '.localhost',
            'status'   => 'active',
            'plan'     => 'basic',
            'settings' => [],
        ];
    }
}
