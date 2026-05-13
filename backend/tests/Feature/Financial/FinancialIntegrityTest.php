<?php

namespace Tests\Feature\Financial;

use App\Models\LedgerAccount;
use App\Models\Tenant;
use App\Models\User;
use App\Models\IdempotencyKey;
use App\Modules\Ledger\LedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use RuntimeException;

class FinancialIntegrityTest extends TestCase
{
    use RefreshDatabase;

    private LedgerService $ledgerService;
    private Tenant $tenant;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->tenant = Tenant::create(['name' => 'Test Tenant', 'slug' => 'test-tenant', 'domain' => 'test.com', 'status' => 'active', 'plan' => 'standard']);
        app()->instance('tenant', $this->tenant);
        $this->ledgerService = app(LedgerService::class);
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);
    }

    /** @test */
    public function test_it_enforces_debit_credit_equality()
    {
        $cashAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Cash',
            'type' => 'asset',
            'code' => '1001'
        ]);

        $revenueAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Sales Revenue',
            'type' => 'revenue',
            'code' => '4001'
        ]);

        // Attempting an unbalanced transaction should fail
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('unbalanced');

        $this->ledgerService->post(
            'TEST_001',
            'Unbalanced test',
            [
                ['account_code' => '1001', 'type' => 'debit', 'amount' => 100.00],
                ['account_code' => '4001', 'type' => 'credit', 'amount' => 99.00], // Off by 1.00
            ],
            $this->tenant->id
        );
    }

    /** @test */
    public function test_it_correctly_balances_and_updates_account_totals()
    {
        $cashAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Cash',
            'type' => 'asset',
            'code' => '1001'
        ]);
        $revenueAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Sales',
            'type' => 'revenue',
            'code' => '4001'
        ]);

        $this->ledgerService->post(
            'SALE_001',
            'Balanced sale',
            [
                ['account_code' => '1001', 'type' => 'debit', 'amount' => 150.00],
                ['account_code' => '4001', 'type' => 'credit', 'amount' => 150.00],
            ],
            $this->tenant->id
        );

        // Asset (Cash): debit increases
        $this->assertEquals(150.00, (float) $cashAccount->refresh()->balance);
        // Revenue: credit increases
        $this->assertEquals(150.00, (float) $revenueAccount->refresh()->balance);
    }

    /** @test */
    public function test_multi_currency_entries_store_correctly()
    {
        $cashAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Cash',
            'type' => 'asset',
            'code' => '1001'
        ]);

        $revenueAccount = LedgerAccount::create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Revenue',
            'type' => 'revenue',
            'code' => '4001'
        ]);

        $this->ledgerService->post(
            'EUR_ORDER_001',
            'EUR transaction',
            [
                ['account_code' => '1001', 'type' => 'debit',  'amount' => 92.00],
                ['account_code' => '4001', 'type' => 'credit', 'amount' => 92.00],
            ],
            $this->tenant->id,
            'EUR',
            0.92
        );

        $entries = \App\Models\LedgerEntry::all();
        foreach ($entries as $entry) {
            $this->assertEquals('EUR', $entry->currency);
            $this->assertEquals(0.92, (float) $entry->exchange_rate);
        }
    }
}
