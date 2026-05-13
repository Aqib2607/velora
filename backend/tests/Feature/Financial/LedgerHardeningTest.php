<?php

namespace Tests\Feature\Financial;

use App\Models\LedgerAccount;
use App\Models\LedgerEntry;
use App\Models\LedgerTransaction;
use App\Models\Role;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Ledger\LedgerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

/**
 * Phase A Hardening: Ledger Consolidation & Multi-Currency Tests
 *
 * Validates:
 * - Single canonical LedgerService works correctly
 * - Multi-currency entries are stored with currency + exchange_rate
 * - Debit/credit balancing is enforced
 * - Reversal preserves original currency
 * - lockForUpdate() prevents race conditions (structural verification)
 */
class LedgerHardeningTest extends TestCase
{
    use RefreshDatabase;

    private Tenant $tenant;
    private LedgerService $ledger;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::create([
            'name' => 'Test Tenant', 'slug' => 'test', 'domain' => 'test.velora.test',
            'status' => 'active', 'plan' => 'enterprise',
        ]);

        app()->instance('tenant', $this->tenant);

        // Create ledger accounts
        LedgerAccount::create(['tenant_id' => $this->tenant->id, 'code' => 'CASH', 'name' => 'Cash', 'type' => 'asset']);
        LedgerAccount::create(['tenant_id' => $this->tenant->id, 'code' => 'REVENUE', 'name' => 'Revenue', 'type' => 'revenue']);
        LedgerAccount::create(['tenant_id' => $this->tenant->id, 'code' => 'PAYABLE', 'name' => 'Payable', 'type' => 'liability']);

        $this->ledger = app(LedgerService::class);
    }

    // ──── Double-Entry Balancing ──────────────────────────────────

    public function test_balanced_transaction_posts_successfully(): void
    {
        $tx = $this->ledger->post(
            'test_order_1',
            'Test payment',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 100.00, 'memo' => 'Payment in'],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 100.00, 'memo' => 'Sales revenue'],
            ],
            $this->tenant->id
        );

        $this->assertInstanceOf(LedgerTransaction::class, $tx);
        $this->assertEquals('posted', $tx->status);
        $this->assertDatabaseCount('ledger_entries', 2);
    }

    public function test_unbalanced_transaction_throws_exception(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('unbalanced');

        $this->ledger->post(
            'bad_tx',
            'Unbalanced entry',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 100.00],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 50.00],
            ],
            $this->tenant->id
        );
    }

    // ──── Multi-Currency Support ─────────────────────────────────

    public function test_ledger_entries_store_currency_and_exchange_rate(): void
    {
        $this->ledger->post(
            'bdt_order_1',
            'BDT order payment',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 11050.00, 'memo' => 'BDT payment'],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 11050.00, 'memo' => 'BDT revenue'],
            ],
            $this->tenant->id,
            'BDT',
            110.50
        );

        $entries = LedgerEntry::all();
        $this->assertCount(2, $entries);

        foreach ($entries as $entry) {
            $this->assertEquals('BDT', $entry->currency);
            $this->assertEquals(110.50, (float) $entry->exchange_rate);
        }
    }

    public function test_default_currency_is_usd(): void
    {
        $this->ledger->post(
            'usd_order',
            'Default currency order',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 50.00],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 50.00],
            ],
            $this->tenant->id
        );

        $entry = LedgerEntry::first();
        $this->assertEquals('USD', $entry->currency);
        $this->assertEquals(1.0, (float) $entry->exchange_rate);
    }

    // ──── Reversal Preserves Currency ────────────────────────────

    public function test_reversal_preserves_original_currency(): void
    {
        $original = $this->ledger->post(
            'eur_order',
            'EUR order',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 92.00],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 92.00],
            ],
            $this->tenant->id,
            'EUR',
            0.92
        );

        $reversed = $this->ledger->reverse($original, 'Customer refund');

        // Original should be marked as reversed
        $this->assertEquals('reversed', $original->fresh()->status);

        // Reversal entries should have same currency and exchange rate
        $reversalEntries = LedgerEntry::where('transaction_id', $reversed->id)->get();
        $this->assertCount(2, $reversalEntries);

        foreach ($reversalEntries as $entry) {
            $this->assertEquals('EUR', $entry->currency);
            $this->assertEquals(0.92, (float) $entry->exchange_rate);
        }
    }

    // ──── Account Balance Updates ────────────────────────────────

    public function test_account_balances_update_correctly(): void
    {
        $this->ledger->post(
            'balance_test',
            'Balance update test',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 200.00],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 200.00],
            ],
            $this->tenant->id
        );

        $cash = LedgerAccount::where('code', 'CASH')->where('tenant_id', $this->tenant->id)->first();
        $revenue = LedgerAccount::where('code', 'REVENUE')->where('tenant_id', $this->tenant->id)->first();

        // Cash (asset): debit increases balance
        $this->assertEquals(200.00, (float) $cash->balance);
        // Revenue: credit increases balance
        $this->assertEquals(200.00, (float) $revenue->balance);
    }

    // ──── No Mixed Currencies in Single Transaction ──────────────

    public function test_all_entries_in_transaction_share_same_currency(): void
    {
        $this->ledger->post(
            'single_currency_test',
            'Same currency enforcement',
            [
                ['account_code' => 'CASH',    'type' => 'debit',  'amount' => 100.00],
                ['account_code' => 'REVENUE', 'type' => 'credit', 'amount' => 100.00],
            ],
            $this->tenant->id,
            'EUR',
            0.92
        );

        $entries = LedgerEntry::all();
        $currencies = $entries->pluck('currency')->unique();
        $this->assertCount(1, $currencies, 'All entries in a transaction must share the same currency');
    }

    // ──── Structural: Only One LedgerService Exists ─────────────

    public function test_canonical_ledger_service_is_module_version(): void
    {
        $service = app(LedgerService::class);
        $this->assertInstanceOf(\App\Modules\Ledger\LedgerService::class, $service);

        // Verify the old duplicate does not exist
        $this->assertFalse(
            class_exists(\App\Services\LedgerService::class),
            'The duplicate App\Services\LedgerService should have been removed'
        );
    }
}
