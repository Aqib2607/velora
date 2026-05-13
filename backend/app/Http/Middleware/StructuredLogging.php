<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class StructuredLogging
{
    public function handle(Request $request, Closure $next)
    {
        $requestId = Str::uuid()->toString();
        $startTime = microtime(true);

        // Inject Request ID into context
        Log::withContext([
            'request_id' => $requestId,
            'tenant_id'  => optional(app('tenant'))->id ?? 'system',
            'user_id'    => optional($request->user())->id ?? 'guest',
            'ip'         => $request->ip(),
            'path'       => $request->path(),
            'method'     => $request->method(),
        ]);

        $response = $next($request);

        $duration = microtime(true) - $startTime;

        // Log the completion
        Log::info('API Request Processed', [
            'status'   => $response->getStatusCode(),
            'duration_ms' => round($duration * 1000, 2),
            // Mask PII
            'user_agent' => $request->userAgent(),
        ]);

        // Add trace header
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }
}
