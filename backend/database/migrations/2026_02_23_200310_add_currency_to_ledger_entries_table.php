<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Hardens the ledger by ensuring all entries are strictly in the base currency (USD).
     * This prevents "currency mixing" inside financial calculations.
     */
    public function up(): void
    {
        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->string('currency', 3)->default('USD')->after('amount');
            $table->decimal('exchange_rate', 10, 4)->default(1.0000)->after('currency');
        });

        // Add check constraint if using MySQL 8.0.16+
        // This ensures no one can manually insert a non-USD entry into the ledger.
        try {
            DB::statement("ALTER TABLE ledger_entries ADD CONSTRAINT check_ledger_currency_usd CHECK (currency = 'USD')");
        } catch (\Exception $e) {
            // Log if check constraints aren't supported by the current DB version
            report($e);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE ledger_entries DROP CONSTRAINT check_ledger_currency_usd");
        } catch (\Exception $e) {
        }

        Schema::table('ledger_entries', function (Blueprint $table) {
            $table->dropColumn(['currency', 'exchange_rate']);
        });
    }
};
