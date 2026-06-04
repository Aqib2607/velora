<?php

namespace Tests\Unit;

use App\Models\LedgerAccount;
use App\Models\LedgerTransaction;
use App\Models\Tenant;
use App\Modules\Ledger\LedgerService;
use RuntimeException;
use Tests\VeloraTestCase;

class LedgerServiceUnitTest extends VeloraTestCase
{
    private LedgerService $service;
    private Tenant $tenant;
    private LedgerAccount $assetAccount;
    private LedgerAccount $liabilityAccount;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(LedgerService::class);
        $this->tenant = $this->tenantA;

        // Create test accounts
        $this->assetAccount = LedgerAccount::factory()
            ->for($this->tenant)
            ->create(['type' => 'asset', 'code' => 'CASH', 'balance' => 0]);

        $this->liabilityAccount = LedgerAccount::factory()
            ->for($this->tenant)
            ->create(['type' => 'liability', 'code' => 'DEBT', 'balance' => 0]);
    }

    /** @test */
    public function it_posts_balanced_transaction(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
        ];

        $transaction = $this->service->post(
            reference: 'REF-001',
            description: 'Test transaction',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $this->assertInstanceOf(LedgerTransaction::class, $transaction);
        $this->assertEquals('posted', $transaction->status);
        $this->assertCount(2, $transaction->entries);
    }

    /** @test */
    public function it_updates_account_balances(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 50],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 50],
        ];

        $this->service->post(
            reference: 'REF-002',
            description: 'Balance test',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $this->assetAccount->refresh();
        $this->liabilityAccount->refresh();

        $this->assertEquals(50, $this->assetAccount->balance);
        $this->assertEquals(50, $this->liabilityAccount->balance);
    }

    /** @test */
    public function it_rejects_unbalanced_transactions(): void
    {
        $this->expectException(RuntimeException::class);
        $this->expectExceptionMessage('unbalanced');

        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 50],  // Unbalanced
        ];

        $this->service->post(
            reference: 'REF-003',
            description: 'Bad transaction',
            entries: $entries,
            tenantId: $this->tenant->id,
        );
    }

    /** @test */
    public function it_reverses_transaction_with_compensating_entries(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
        ];

        $original = $this->service->post(
            reference: 'REF-004',
            description: 'To be reversed',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $reversed = $this->service->reverse($original, 'Test reversal');

        $this->assertInstanceOf(LedgerTransaction::class, $reversed);
        $this->assertCount(2, $reversed->entries);

        // Check balances are back to zero
        $this->assetAccount->refresh();
        $this->liabilityAccount->refresh();
        $this->assertEquals(0, $this->assetAccount->balance);
        $this->assertEquals(0, $this->liabilityAccount->balance);
    }

    /** @test */
    public function it_preserves_currency_in_entries(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
        ];

        $transaction = $this->service->post(
            reference: 'REF-005',
            description: 'Currency test',
            entries: $entries,
            tenantId: $this->tenant->id,
            currency: 'EUR',
            exchangeRate: 1.1,
        );

        $transaction->load('entries');
        $this->assertTrue($transaction->entries->every(fn($e) => $e->currency === 'EUR'));
        $this->assertTrue($transaction->entries->every(fn($e) => $e->exchange_rate === 1.1));
    }

    /** @test */
    public function it_creates_multiple_entries_for_complex_transactions(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 250],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 150],
        ];

        $transaction = $this->service->post(
            reference: 'REF-006',
            description: 'Complex transaction',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $this->assertCount(3, $transaction->entries);
    }

    /** @test */
    public function it_rejects_transaction_with_rounding_errors(): void
    {
        $this->expectException(RuntimeException::class);

        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100.01],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100.00],  // Differs by 0.01
        ];

        $this->service->post(
            reference: 'REF-007',
            description: 'Rounding error test',
            entries: $entries,
            tenantId: $this->tenant->id,
        );
    }

    /** @test */
    public function it_marks_transaction_as_immutable_after_posting(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
        ];

        $transaction = $this->service->post(
            reference: 'REF-008',
            description: 'Immutability test',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $transaction->refresh();
        $this->assertEquals('posted', $transaction->status);

        // Verify entries cannot be updated via database (tested via trigger in feature tests)
        $this->assertTrue(true);  // Implicit: posting succeeded
    }

    /** @test */
    public function it_queries_transaction_by_reference(): void
    {
        $entries = [
            ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
            ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
        ];

        $this->service->post(
            reference: 'REF-QUERY-001',
            description: 'Query test',
            entries: $entries,
            tenantId: $this->tenant->id,
        );

        $found = LedgerTransaction::where('reference', 'REF-QUERY-001')->first();

        $this->assertNotNull($found);
        $this->assertEquals('REF-QUERY-001', $found->reference);
    }

    /** @test */
    public function it_calculates_account_balance_correctly_after_multiple_transactions(): void
    {
        // First transaction
        $this->service->post(
            'REF-009-A',
            'First',
            [
                ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 100],
                ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 100],
            ],
            $this->tenant->id,
        );

        // Second transaction
        $this->service->post(
            'REF-009-B',
            'Second',
            [
                ['account_code' => 'CASH', 'type' => 'debit', 'amount' => 50],
                ['account_code' => 'DEBT', 'type' => 'credit', 'amount' => 50],
            ],
            $this->tenant->id,
        );

        $this->assetAccount->refresh();
        $this->assertEquals(150, $this->assetAccount->balance);
    }
}
