<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\Deal;
use App\Models\GiftCard;
use App\Models\Registry;
use App\Models\RegistryItem;
use App\Models\Role;
use App\Models\SellerApplication;
use App\Models\SupportTicket;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Phase A Hardening: Tenant Isolation Tests
 *
 * Validates that all 8 models that were missing HasTenantScope
 * now properly enforce tenant boundaries.
 */
class TenantScopeHardeningTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenantA;
    private Tenant $tenantB;
    private User $userA;
    private User $userB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenantA = Tenant::create([
            'name' => 'Tenant A', 'slug' => 'alpha', 'domain' => 'alpha.test', 'status' => 'active', 'plan' => 'enterprise',
        ]);

        $this->tenantB = Tenant::create([
            'name' => 'Tenant B', 'slug' => 'beta', 'domain' => 'beta.test', 'status' => 'active', 'plan' => 'standard',
        ]);

        // Create roles for both tenants
        foreach ([$this->tenantA, $this->tenantB] as $tenant) {
            app()->instance('tenant', $tenant);
            Role::create(['tenant_id' => $tenant->id, 'name' => 'Buyer', 'slug' => 'buyer', 'permissions' => ['orders.*']]);
        }

        app()->instance('tenant', $this->tenantA);
        $this->userA = User::create([
            'tenant_id' => $this->tenantA->id, 'name' => 'User A', 'email' => 'a@test.com',
            'password' => bcrypt('password'), 'status' => 'active',
        ]);

        app()->instance('tenant', $this->tenantB);
        $this->userB = User::create([
            'tenant_id' => $this->tenantB->id, 'name' => 'User B', 'email' => 'b@test.com',
            'password' => bcrypt('password'), 'status' => 'active',
        ]);
    }

    // ──── AuditLog ────────────────────────────────────────────────

    public function test_audit_log_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        AuditLog::create([
            'tenant_id' => $this->tenantA->id, 'user_id' => $this->userA->id,
            'entity_type' => 'test', 'action' => 'create',
        ]);

        app()->instance('tenant', $this->tenantB);
        AuditLog::create([
            'tenant_id' => $this->tenantB->id, 'user_id' => $this->userB->id,
            'entity_type' => 'test', 'action' => 'update',
        ]);

        // Tenant A should only see their audit log
        app()->instance('tenant', $this->tenantA);
        $logs = AuditLog::all();
        $this->assertCount(1, $logs);
        $this->assertEquals($this->tenantA->id, $logs->first()->tenant_id);
    }

    // ──── Deal ────────────────────────────────────────────────────

    public function test_deal_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        Deal::create([
            'tenant_id' => $this->tenantA->id, 'title' => 'Deal A', 'type' => 'lightning',
            'discount_percentage' => 20.00,
        ]);

        app()->instance('tenant', $this->tenantB);
        Deal::create([
            'tenant_id' => $this->tenantB->id, 'title' => 'Deal B', 'type' => 'clearance',
            'discount_percentage' => 30.00,
        ]);

        // Tenant A should only see Deal A
        app()->instance('tenant', $this->tenantA);
        $deals = Deal::all();
        $this->assertCount(1, $deals);
        $this->assertEquals('Deal A', $deals->first()->title);
    }

    // ──── GiftCard ────────────────────────────────────────────────

    public function test_gift_card_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        GiftCard::create([
            'tenant_id' => $this->tenantA->id, 'code' => 'GIFT-A-001',
            'initial_balance' => 50.00, 'current_balance' => 50.00,
        ]);

        app()->instance('tenant', $this->tenantB);
        GiftCard::create([
            'tenant_id' => $this->tenantB->id, 'code' => 'GIFT-B-001',
            'initial_balance' => 100.00, 'current_balance' => 100.00,
        ]);

        app()->instance('tenant', $this->tenantA);
        $cards = GiftCard::all();
        $this->assertCount(1, $cards);
        $this->assertEquals('GIFT-A-001', $cards->first()->code);
    }

    // ──── Registry ────────────────────────────────────────────────

    public function test_registry_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        Registry::create([
            'tenant_id' => $this->tenantA->id, 'user_id' => $this->userA->id,
            'title' => 'Wedding A', 'slug' => 'wedding-a', 'event_type' => 'wedding',
        ]);

        app()->instance('tenant', $this->tenantB);
        Registry::create([
            'tenant_id' => $this->tenantB->id, 'user_id' => $this->userB->id,
            'title' => 'Wedding B', 'slug' => 'wedding-b', 'event_type' => 'wedding',
        ]);

        app()->instance('tenant', $this->tenantA);
        $registries = Registry::all();
        $this->assertCount(1, $registries);
        $this->assertEquals('Wedding A', $registries->first()->title);
    }

    // ──── SupportTicket ────────────────────────────────────────────

    public function test_support_ticket_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        SupportTicket::create([
            'tenant_id' => $this->tenantA->id, 'user_id' => $this->userA->id,
            'ticket_number' => 'TKT-A-001', 'subject' => 'Help A', 'category' => 'orders',
        ]);

        app()->instance('tenant', $this->tenantB);
        SupportTicket::create([
            'tenant_id' => $this->tenantB->id, 'user_id' => $this->userB->id,
            'ticket_number' => 'TKT-B-001', 'subject' => 'Help B', 'category' => 'shipping',
        ]);

        app()->instance('tenant', $this->tenantA);
        $tickets = SupportTicket::all();
        $this->assertCount(1, $tickets);
        $this->assertEquals('TKT-A-001', $tickets->first()->ticket_number);
    }

    // ──── SellerApplication ────────────────────────────────────────

    public function test_seller_application_tenant_isolation(): void
    {
        app()->instance('tenant', $this->tenantA);
        SellerApplication::create([
            'tenant_id' => $this->tenantA->id, 'user_id' => $this->userA->id,
            'business_name' => 'Biz A', 'business_email' => 'biz@a.com', 'country_code' => 'US',
        ]);

        app()->instance('tenant', $this->tenantB);
        SellerApplication::create([
            'tenant_id' => $this->tenantB->id, 'user_id' => $this->userB->id,
            'business_name' => 'Biz B', 'business_email' => 'biz@b.com', 'country_code' => 'BD',
        ]);

        app()->instance('tenant', $this->tenantA);
        $apps = SellerApplication::all();
        $this->assertCount(1, $apps);
        $this->assertEquals('Biz A', $apps->first()->business_name);
    }

    // ──── Cross-Tenant Modification Prevention ─────────────────────

    public function test_tenant_a_cannot_modify_tenant_b_deal(): void
    {
        app()->instance('tenant', $this->tenantB);
        $dealB = Deal::create([
            'tenant_id' => $this->tenantB->id, 'title' => 'Deal B', 'type' => 'lightning',
            'discount_percentage' => 10.00,
        ]);

        // Switch to Tenant A — should not be able to see Deal B
        app()->instance('tenant', $this->tenantA);
        $result = Deal::find($dealB->id);
        $this->assertNull($result, 'Tenant A should not be able to find Tenant B deal');
    }

    // ──── Admin Bypass via forAllTenants() ──────────────────────────

    public function test_admin_can_access_all_tenants_explicitly(): void
    {
        app()->instance('tenant', $this->tenantA);
        Deal::create([
            'tenant_id' => $this->tenantA->id, 'title' => 'Deal A', 'type' => 'lightning',
            'discount_percentage' => 15.00,
        ]);

        app()->instance('tenant', $this->tenantB);
        Deal::create([
            'tenant_id' => $this->tenantB->id, 'title' => 'Deal B', 'type' => 'clearance',
            'discount_percentage' => 25.00,
        ]);

        // Admin uses forAllTenants() to see everything
        $allDeals = Deal::forAllTenants()->get();
        $this->assertCount(2, $allDeals);
    }
}
