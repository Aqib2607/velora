<?php

namespace App\Http\Middleware;

use App\Services\MetricsService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class MetricsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip metrics endpoint to avoid recursive recording
        if ($request->path() === 'metrics') {
            return $next($request);
        }

        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);

        $response = $next($request);

        $duration = microtime(true) - $startTime;
        $statusCode = $response->getStatusCode();
        $method = $request->getMethod();
        $endpoint = $request->path();

        // Normalize endpoint to avoid high cardinality
        $endpoint = $this->normalizeEndpoint($endpoint);

        // Get request size
        $requestSize = strlen($request->getContent());

        // Record metrics
        MetricsService::recordHttpRequest(
            $method,
            $endpoint,
            $statusCode,
            $duration,
            $requestSize
        );

        return $response;
    }

    /**
     * Normalize endpoint path to reduce cardinality
     * e.g., /v1/orders/123 becomes /v1/orders/{id}
     */
    private function normalizeEndpoint(string $endpoint): string
    {
        // Replace numeric IDs with placeholders
        $endpoint = preg_replace('#\d+#', '{id}', $endpoint);
        // Limit length
        return substr($endpoint, 0, 100);
    }
}
