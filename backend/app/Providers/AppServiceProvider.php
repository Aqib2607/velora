<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Cache\RateLimiting\Limit;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register module services for dependency injection
        $this->app->singleton(\App\Modules\Identity\AuthService::class);
        $this->app->singleton(\App\Modules\Inventory\InventoryService::class);
        $this->app->singleton(\App\Modules\Ledger\LedgerService::class);
        $this->app->singleton(\App\Modules\Payment\PaymentService::class);
        $this->app->singleton(\App\Modules\Commission\CommissionService::class);

        $this->app->singleton(\App\Modules\Refund\RefundService::class, function ($app) {
            return new \App\Modules\Refund\RefundService(
                $app->make(\App\Modules\Payment\PaymentService::class),
                $app->make(\App\Modules\Ledger\LedgerService::class),
            );
        });

        $this->app->singleton(\App\Modules\Payout\PayoutService::class, function ($app) {
            return new \App\Modules\Payout\PayoutService(
                $app->make(\App\Modules\Payment\PaymentService::class),
                $app->make(\App\Modules\Ledger\LedgerService::class),
            );
        });

        $this->app->singleton(\App\Modules\Order\OrderSagaOrchestrator::class, function ($app) {
            return new \App\Modules\Order\OrderSagaOrchestrator(
                $app->make(\App\Modules\Inventory\InventoryService::class),
                $app->make(\App\Modules\Payment\PaymentService::class),
                $app->make(\App\Modules\Ledger\LedgerService::class),
                $app->make(\App\Modules\Commission\CommissionService::class),
            );
        });

        // Bind a default null tenant (will be replaced by ResolveTenant middleware)
        $this->app->bind('tenant', fn() => null);
    }

    public function boot(): void
    {
        // Register observers
        \App\Models\Product::observe(\App\Observers\ProductObserver::class);

        // Register database query listener for metrics
        \Illuminate\Support\Facades\Event::listen(
            \Illuminate\Database\Events\QueryExecuted::class,
            \App\Listeners\RecordDatabaseQuery::class
        );

        // Strict mode — detect N+1 queries and lazy loading violations in non-production
        Model::preventLazyLoading(!app()->isProduction());

        // Enforce strict MySQL mode (only when running MySQL)
        try {
            if (DB::connection()->getDriverName() === 'mysql') {
                DB::statement("SET SESSION sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION'");
            }
        } catch (\Exception $e) {
            // Ignore DB connection errors during boot (e.g. for route:list)
        }

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('App\Models\User::api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('financial', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }
}
