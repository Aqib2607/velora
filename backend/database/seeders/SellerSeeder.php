<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\SellerProfile;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;

class SellerSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::where('slug', 'alpha')->first();
        app()->instance('tenant', $tenant);

        $faker = Faker::create();
        $sellerRole = Role::where('tenant_id', $tenant->id)->where('slug', 'seller')->first();

        // Target: 50 Sellers
        for ($i = 0; $i < 50; $i++) {
            $user = User::create([
                'tenant_id' => $tenant->id,
                'name'      => $faker->name,
                'email'     => $faker->unique()->safeEmail,
                'phone'     => $faker->phoneNumber,
                'password'  => Hash::make('password'),
                'status'    => 'active',
            ]);

            $user->roles()->attach($sellerRole);

            SellerProfile::create([
                'tenant_id'       => $tenant->id,
                'user_id'         => $user->id,
                'business_name'   => $faker->company . ' ' . $faker->companySuffix,
                'status'          => 'approved',
                'commission_rate' => 10.00,
            ]);
        }

        app()->instance('tenant', null);
    }
}
