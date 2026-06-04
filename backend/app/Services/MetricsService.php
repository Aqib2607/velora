<?php

namespace App\Services;

use Prometheus\Client;
use Prometheus\CollectorRegistry;
use Prometheus\Renderer\RenderTextFormat;
use Prometheus\Storage\Redis;

class MetricsService
{
    private static ?CollectorRegistry $registry = null;

    public static function registry(): CollectorRegistry
    {
        if (self::$registry === null) {
            try {
                $options = config('database.redis.default') ?: [];
                $options = is_array($options) ? $options : [];
                self::$registry = new CollectorRegistry(new Redis($options));
            } catch (\Throwable $e) {
                // Fallback to InMemory storage if Redis connection fails or configuration is wrong
                self::$registry = new CollectorRegistry(new \Prometheus\Storage\InMemory());
            }
        }
        return self::$registry;
    }

    /**
     * Initialize all metrics collectors
     */
    public static function initializeMetrics(): void
    {
        $registry = self::registry();

        // HTTP Request Metrics
        $registry->registerCounter('velora', 'http_requests_total',
            'Total HTTP requests',
            ['method', 'status', 'endpoint']
        );

        $registry->registerHistogram('velora', 'http_request_duration_seconds',
            'HTTP request latency in seconds',
            ['method', 'endpoint'],
            [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1.0, 2.5, 5.0, 10.0]
        );

        $registry->registerGauge('velora', 'http_request_size_bytes',
            'HTTP request size in bytes',
            ['method', 'endpoint']
        );

        // Database Metrics
        $registry->registerHistogram('velora', 'database_query_duration_seconds',
            'Database query latency',
            ['connection'],
            [0.001, 0.01, 0.1, 0.5, 1.0, 5.0]
        );

        $registry->registerCounter('velora', 'database_query_errors_total',
            'Total database query errors',
            ['connection']
        );

        // Queue Metrics
        $registry->registerGauge('velora', 'queue_jobs_pending',
            'Pending jobs in queue',
            ['queue', 'job']
        );

        $registry->registerHistogram('velora', 'queue_job_duration_seconds',
            'Job processing time',
            ['queue', 'job'],
            [0.1, 0.5, 1.0, 5.0, 10.0, 30.0, 60.0]
        );

        $registry->registerCounter('velora', 'queue_job_failures_total',
            'Total failed jobs',
            ['queue', 'job']
        );

        // Business Logic Metrics
        $registry->registerCounter('velora', 'orders_created_total',
            'Total orders created',
            ['status', 'region']
        );

        $registry->registerCounter('velora', 'orders_completed_total',
            'Total completed orders',
            ['region']
        );

        $registry->registerGauge('velora', 'gmv_total',
            'Gross Merchandise Value',
            ['region']
        );

        $registry->registerCounter('velora', 'transactions_total',
            'Total transactions',
            ['status', 'type']
        );

        $registry->registerGauge('velora', 'transaction_value_total',
            'Total transaction value',
            ['type', 'status']
        );

        // Refund Metrics
        $registry->registerCounter('velora', 'refunds_initiated_total',
            'Total refunds initiated',
            ['reason']
        );

        $registry->registerCounter('velora', 'refunds_completed_total',
            'Total refunds completed',
            ['reason']
        );

        $registry->registerGauge('velora', 'refund_value_total',
            'Total refund value',
            ['reason']
        );

        // Payment Metrics
        $registry->registerCounter('velora', 'payments_processed_total',
            'Total payments processed',
            ['status', 'gateway']
        );

        $registry->registerHistogram('velora', 'payment_processing_duration_seconds',
            'Payment processing latency',
            ['gateway'],
            [0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
        );

        $registry->registerCounter('velora', 'payment_errors_total',
            'Total payment errors',
            ['error_type', 'gateway']
        );

        // Merchant Metrics
        $registry->registerCounter('velora', 'merchants_onboarded_total',
            'Total merchants onboarded',
            ['status']
        );

        $registry->registerGauge('velora', 'active_merchants',
            'Number of active merchants',
            ['region']
        );

        $registry->registerCounter('velora', 'merchant_payouts_total',
            'Total merchant payouts',
            ['status']
        );

        // Commission Metrics
        $registry->registerGauge('velora', 'commission_collected_total',
            'Total commission collected',
            ['type']
        );

        $registry->registerCounter('velora', 'commission_calculation_errors_total',
            'Total commission calculation errors',
            ['rule_type']
        );

        // Search Metrics
        $registry->registerHistogram('velora', 'search_query_duration_seconds',
            'Search query latency',
            ['index'],
            [0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
        );

        $registry->registerCounter('velora', 'search_queries_total',
            'Total search queries',
            ['index', 'status']
        );

        $registry->registerGauge('velora', 'search_zero_results_rate',
            'Zero-result search rate'
        );

        // Cache Metrics
        $registry->registerCounter('velora', 'cache_hits_total',
            'Total cache hits',
            ['key_prefix']
        );

        $registry->registerCounter('velora', 'cache_misses_total',
            'Total cache misses',
            ['key_prefix']
        );

        // Authentication Metrics
        $registry->registerCounter('velora', 'auth_attempts_total',
            'Total authentication attempts',
            ['status']
        );

        $registry->registerCounter('velora', 'auth_failures_total',
            'Total authentication failures',
            ['reason']
        );

        // Error/Exception Metrics
        $registry->registerCounter('velora', 'exceptions_total',
            'Total exceptions thrown',
            ['exception_type']
        );

        // Redis Connection Metrics
        $registry->registerGauge('velora', 'redis_connected_clients',
            'Number of Redis clients'
        );

        $registry->registerGauge('velora', 'redis_memory_usage_bytes',
            'Redis memory usage in bytes'
        );

        // Service Health Metrics
        $registry->registerGauge('velora', 'service_health',
            'Service health status',
            ['service']
        );
    }

    /**
     * Record HTTP request
     */
    public static function recordHttpRequest(
        string $method,
        string $endpoint,
        int $statusCode,
        float $duration,
        int $requestSize = 0
    ): void {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterCounter('velora', 'http_requests_total',
                'Total HTTP requests',
                ['method', 'status', 'endpoint']
            )->inc(['method' => $method, 'status' => (string)$statusCode, 'endpoint' => $endpoint]);

            $registry->getOrRegisterHistogram('velora', 'http_request_duration_seconds',
                'HTTP request latency',
                ['method', 'endpoint']
            )->observe($duration, ['method' => $method, 'endpoint' => $endpoint]);

            if ($requestSize > 0) {
                $registry->getOrRegisterGauge('velora', 'http_request_size_bytes',
                    'HTTP request size',
                    ['method', 'endpoint']
                )->set($requestSize, ['method' => $method, 'endpoint' => $endpoint]);
            }
        } catch (\Exception $e) {
            // Silently fail to prevent metrics from breaking the application
            \Log::warning('Metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record database query
     */
    public static function recordDatabaseQuery(string $connection, float $duration, bool $failed = false): void
    {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterHistogram('velora', 'database_query_duration_seconds',
                'Database query latency',
                ['connection']
            )->observe($duration, ['connection' => $connection]);

            if ($failed) {
                $registry->getOrRegisterCounter('velora', 'database_query_errors_total',
                    'Database query errors',
                    ['connection']
                )->inc(['connection' => $connection]);
            }
        } catch (\Exception $e) {
            \Log::warning('Database metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record order creation
     */
    public static function recordOrderCreated(string $status, string $region, float $value): void
    {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterCounter('velora', 'orders_created_total',
                'Orders created',
                ['status', 'region']
            )->inc(['status' => $status, 'region' => $region]);

            $registry->getOrRegisterGauge('velora', 'gmv_total',
                'GMV',
                ['region']
            )->incBy($value, ['region' => $region]);
        } catch (\Exception $e) {
            \Log::warning('Order metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record payment processing
     */
    public static function recordPayment(string $gateway, string $status, float $duration): void
    {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterCounter('velora', 'payments_processed_total',
                'Payments processed',
                ['status', 'gateway']
            )->inc(['status' => $status, 'gateway' => $gateway]);

            $registry->getOrRegisterHistogram('velora', 'payment_processing_duration_seconds',
                'Payment processing latency',
                ['gateway']
            )->observe($duration, ['gateway' => $gateway]);
        } catch (\Exception $e) {
            \Log::warning('Payment metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record refund
     */
    public static function recordRefund(string $status, string $reason, float $value): void
    {
        try {
            $registry = self::registry();
            
            if ($status === 'completed') {
                $registry->getOrRegisterCounter('velora', 'refunds_completed_total',
                    'Refunds completed',
                    ['reason']
                )->inc(['reason' => $reason]);

                $registry->getOrRegisterGauge('velora', 'refund_value_total',
                    'Refund value',
                    ['reason']
                )->incBy($value, ['reason' => $reason]);
            } else {
                $registry->getOrRegisterCounter('velora', 'refunds_initiated_total',
                    'Refunds initiated',
                    ['reason']
                )->inc(['reason' => $reason]);
            }
        } catch (\Exception $e) {
            \Log::warning('Refund metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record search query
     */
    public static function recordSearch(string $index, string $status, float $duration, bool $zeroResults = false): void
    {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterCounter('velora', 'search_queries_total',
                'Search queries',
                ['index', 'status']
            )->inc(['index' => $index, 'status' => $status]);

            $registry->getOrRegisterHistogram('velora', 'search_query_duration_seconds',
                'Search latency',
                ['index']
            )->observe($duration, ['index' => $index]);

            if ($zeroResults) {
                $registry->getOrRegisterGauge('velora', 'search_zero_results_rate',
                    'Zero-result rate'
                )->inc();
            }
        } catch (\Exception $e) {
            \Log::warning('Search metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record queue job
     */
    public static function recordQueueJob(string $queue, string $job, string $status, float $duration): void
    {
        try {
            $registry = self::registry();
            
            if ($status === 'failed') {
                $registry->getOrRegisterCounter('velora', 'queue_job_failures_total',
                    'Job failures',
                    ['queue', 'job']
                )->inc(['queue' => $queue, 'job' => $job]);
            } else {
                $registry->getOrRegisterHistogram('velora', 'queue_job_duration_seconds',
                    'Job duration',
                    ['queue', 'job']
                )->observe($duration, ['queue' => $queue, 'job' => $job]);
            }
        } catch (\Exception $e) {
            \Log::warning('Queue metrics recording failed: ' . $e->getMessage());
        }
    }

    /**
     * Record exception
     */
    public static function recordException(string $exceptionType): void
    {
        try {
            $registry = self::registry();
            
            $registry->getOrRegisterCounter('velora', 'exceptions_total',
                'Exceptions thrown',
                ['exception_type']
            )->inc(['exception_type' => $exceptionType]);
        } catch (\Exception $e) {
            // Silent fail
        }
    }

    /**
     * Get metrics in Prometheus text format
     */
    public static function getMetricsOutput(): string
    {
        try {
            $registry = self::registry();
            $renderer = new RenderTextFormat();
            return $renderer->render($registry->collect());
        } catch (\Exception $e) {
            return "# Error rendering metrics: " . $e->getMessage() . "\n";
        }
    }
}
