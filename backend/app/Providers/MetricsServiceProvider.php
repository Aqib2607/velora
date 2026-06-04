<?php

namespace App\Providers;

use App\Http\Middleware\MetricsMiddleware;
use App\Services\MetricsService;
use Illuminate\Support\ServiceProvider;

class MetricsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Register MetricsService as singleton
        $this->app->singleton(MetricsService::class, function () {
            return new MetricsService();
        });
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Initialize metrics collectors
        MetricsService::initializeMetrics();

        // Register the middleware globally
        $this->app['router']->pushMiddlewareToGroup('api', MetricsMiddleware::class);
    }
}
