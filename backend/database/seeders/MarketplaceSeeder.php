<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MarketplaceSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Marketplace Population...');

        $this->call([
            CategorySeeder::class,
            SellerSeeder::class,
            ProductSeeder::class,
            OrderSeeder::class,
        ]);

        $this->command->info('Marketplace populated successfully!');
    }
}
