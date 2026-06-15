<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\CommissionRule;
use App\Models\Inventory;
use App\Models\LedgerAccount;
use App\Models\Product;
use App\Models\Role;
use App\Models\SellerProfile;
use App\Models\Sku;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Tenants
        $tenantA = Tenant::create([
            'name'   => 'Tenant Alpha',
            'slug'   => 'alpha',
            'domain' => 'alpha.velora.test',
            'status' => 'active',
            'plan'   => 'enterprise',
        ]);

        $tenantB = Tenant::create([
            'name'   => 'Tenant Beta',
            'slug'   => 'beta',
            'domain' => 'beta.velora.test',
            'status' => 'active',
            'plan'   => 'standard',
        ]);

        // ── Roles (per tenant)
        foreach ([$tenantA, $tenantB] as $tenant) {
            app()->instance('tenant', $tenant);

            Role::create(['tenant_id' => $tenant->id, 'name' => 'Admin',  'slug' => 'admin',  'permissions' => ['*']]);
            Role::create(['tenant_id' => $tenant->id, 'name' => 'Seller', 'slug' => 'seller', 'permissions' => ['catalog.*', 'orders.view']]);
            Role::create(['tenant_id' => $tenant->id, 'name' => 'Buyer',  'slug' => 'buyer',  'permissions' => ['orders.*', 'cart.*']]);
        }

        // ── Users for Tenant A
        app()->instance('tenant', $tenantA);

        $adminA = User::create([
            'tenant_id' => $tenantA->id,
            'name'      => 'Admin Alpha',
            'email'     => 'admin@alpha.test',
            'password'  => Hash::make('password'),
            'status'    => 'active',
        ]);
        $adminA->roles()->attach(Role::where('tenant_id', $tenantA->id)->where('slug', 'admin')->first());

        $sellerUserA = User::create([
            'tenant_id' => $tenantA->id,
            'name'      => 'Seller Alpha',
            'email'     => 'seller@alpha.test',
            'password'  => Hash::make('password'),
            'status'    => 'active',
        ]);
        $sellerUserA->roles()->attach(Role::where('tenant_id', $tenantA->id)->where('slug', 'seller')->first());

        $buyerA = User::create([
            'tenant_id' => $tenantA->id,
            'name'      => 'Buyer Alpha',
            'email'     => 'buyer@alpha.test',
            'password'  => Hash::make('password'),
            'status'    => 'active',
        ]);
        $buyerA->roles()->attach(Role::where('tenant_id', $tenantA->id)->where('slug', 'buyer')->first());

        // ── Users for Tenant B
        app()->instance('tenant', $tenantB);

        $buyerB = User::create([
            'tenant_id' => $tenantB->id,
            'name'      => 'Buyer Beta',
            'email'     => 'buyer@beta.test',
            'password'  => Hash::make('password'),
            'status'    => 'active',
        ]);

        // ── Seller Profile for Tenant A
        app()->instance('tenant', $tenantA);

        $sellerProfile = SellerProfile::create([
            'tenant_id'       => $tenantA->id,
            'user_id'         => $sellerUserA->id,
            'business_name'   => 'Alpha Store',
            'status'          => 'approved',
            'commission_rate' => 10.00,
        ]);

        // ── Category + Product + SKU + Inventory for Tenant A
        $category = Category::create([
            'tenant_id' => $tenantA->id,
            'name'      => 'Electronics',
            'slug'      => 'electronics',
            'is_active' => true,
        ]);

        $product = Product::create([
            'tenant_id'        => $tenantA->id,
            'seller_profile_id' => $sellerProfile->id,
            'category_id'      => $category->id,
            'name'             => 'Test Widget',
            'slug'             => 'test-widget',
            'status'           => 'active',
        ]);

        $sku = Sku::create([
            'tenant_id'  => $tenantA->id,
            'product_id' => $product->id,
            'sku_code'   => 'WIDGET-001',
            'price'      => 99.99,
            'is_active'  => true,
        ]);

        Inventory::create([
            'sku_id'             => $sku->id,
            'quantity_available' => 100,
            'quantity_reserved'  => 0,
            'quantity_sold'      => 0,
        ]);

        // ── Commission Rule for Tenant A
        CommissionRule::create([
            'tenant_id'  => $tenantA->id,
            'name'       => 'Default 10%',
            'type'       => 'percentage',
            'rate'       => 10.00,
            'is_default' => true,
            'is_active'  => true,
        ]);

        // ── Ledger Accounts for both tenants
        foreach ([$tenantA, $tenantB] as $tenant) {
            app()->instance('tenant', $tenant);
            foreach (
                [
                    ['code' => 'CASH',    'name' => 'Cash',               'type' => 'asset'],
                    ['code' => 'REVENUE', 'name' => 'Sales Revenue',       'type' => 'revenue'],
                    ['code' => 'PAYABLE', 'name' => 'Seller Payable',      'type' => 'liability'],
                    ['code' => 'EXPENSE', 'name' => 'Operating Expenses',  'type' => 'expense'],
                ] as $account
            ) {
                LedgerAccount::create([
                    'tenant_id' => $tenant->id,
                    'code'      => $account['code'],
                    'name'      => $account['name'],
                    'type'      => $account['type'],
                ]);
            }
        }

        // Reset tenant binding
        app()->instance('tenant', null);

        // Run Marketplace Population
        $this->call(MarketplaceSeeder::class);
    }
}
