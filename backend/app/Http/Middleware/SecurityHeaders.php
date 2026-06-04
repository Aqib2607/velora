<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * SecurityHeaders — adds OWASP-recommended HTTP security headers to every response.
 *
 * Register in bootstrap/app.php:
 *   ->withMiddleware(function (Middleware $middleware) {
 *       $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
 *   })
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): mixed
    {
        $response = $next($request);

        // Prevent clickjacking
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // Prevent MIME-type sniffing
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Force HTTPS for 1 year (including subdomains)
        $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

        // Disable browser features not needed by the API
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

        // Referrer policy for cross-origin requests
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Content Security Policy (API — no HTML returned so minimal CSP needed)
        $response->headers->set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");

        // Remove server fingerprint header
        $response->headers->remove('X-Powered-By');
        $response->headers->remove('Server');

        return $response;
    }
}
