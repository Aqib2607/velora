<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Global middleware
        $middleware->trustProxies(at: '*');

        // Register middleware aliases
        $middleware->append(\App\Http\Middleware\StructuredLogging::class);
        $middleware->alias([
            'resolve.tenant' => \App\Http\Middleware\ResolveTenant::class,
            'idempotency'    => \App\Http\Middleware\IdempotencyMiddleware::class,
            'audit.log'      => \App\Http\Middleware\AuditLogMiddleware::class,
            'cache.api'      => \App\Http\Middleware\CacheApiResponse::class,
        ]);

        // Sanctum stateful domains (for SPA / cookie auth)
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Return JSON for API routes
        $exceptions->shouldRenderJsonWhen(
            fn($request) => $request->is('api/*') || $request->expectsJson()
        );
    })->create();
