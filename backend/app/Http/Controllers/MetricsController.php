<?php

namespace App\Http\Controllers;

use App\Services\MetricsService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MetricsController extends Controller
{
    /**
     * Expose metrics in Prometheus text format
     * Route: GET /metrics
     * No authentication required (internal monitoring endpoint)
     */
    public function metrics(): Response
    {
        MetricsService::initializeMetrics();
        
        return response(
            MetricsService::getMetricsOutput(),
            200,
            ['Content-Type' => 'text/plain; charset=UTF-8']
        );
    }

    /**
     * Receive frontend metrics from browser
     * Route: POST /api/v1/metrics
     * 
     * Expected payload:
     * {
     *   "metrics": [
     *     { "name": "web_vital_lcp", "value": 1200, "unit": "ms", "timestamp": 1234567890, "labels": {...} }
     *   ],
     *   "userAgent": "Mozilla/5.0...",
     *   "url": "https://velora.com/products",
     *   "timestamp": 1234567890
     * }
     */
    public function receiveFrontendMetrics(Request $request): Response
    {
        try {
            $validated = $request->validate([
                'metrics' => 'required|array|max:100',
                'metrics.*.name' => 'required|string|max:100',
                'metrics.*.value' => 'required|numeric',
                'metrics.*.unit' => 'required|string|max:50',
                'metrics.*.timestamp' => 'required|integer',
                'metrics.*.labels' => 'nullable|array',
                'userAgent' => 'nullable|string|max:500',
                'url' => 'nullable|string|max:500',
                'timestamp' => 'required|integer',
            ]);

            // Process each metric
            foreach ($validated['metrics'] as $metric) {
                $this->processFrontendMetric($metric);
            }

            return response()->json(['status' => 'ok'], 202);
        } catch (\Exception $e) {
            \Log::warning('Failed to process frontend metrics: ' . $e->getMessage());
            return response()->json(['error' => 'invalid_request'], 400);
        }
    }

    /**
     * Process a single frontend metric
     */
    private function processFrontendMetric(array $metric): void
    {
        try {
            $registry = MetricsService::registry();
            $name = $metric['name'] ?? 'unknown';
            $value = $metric['value'] ?? 0;
            $labels = $metric['labels'] ?? [];

            switch ($name) {
                case 'web_vital_lcp':
                case 'web_vital_cls':
                case 'web_vital_ttfb':
                case 'web_vital_inp':
                    // Record as histogram
                    $registry->getOrRegisterHistogram(
                        'velora_' . $name,
                        'Frontend ' . $name,
                        array_keys($labels),
                        [0, 100, 500, 1000, 2500, 5000]
                    )->observe($value, array_values($labels));
                    break;

                case 'frontend_error_total':
                    $registry->getOrRegisterCounter(
                        'velora_' . $name,
                        'Frontend errors',
                        array_keys($labels)
                    )->inc(array_values($labels));
                    break;

                case 'frontend_api_latency_ms':
                    $registry->getOrRegisterHistogram(
                        'velora_' . $name,
                        'Frontend API latency',
                        array_keys($labels),
                        [10, 50, 100, 500, 1000, 5000]
                    )->observe($value, array_values($labels));
                    break;

                case 'page_load_duration_ms':
                case 'dom_interactive_time_ms':
                case 'dom_content_loaded_time_ms':
                    $registry->getOrRegisterHistogram(
                        'velora_' . $name,
                        'Frontend ' . $name,
                        array_keys($labels),
                        [100, 500, 1000, 2500, 5000, 10000]
                    )->observe($value, array_values($labels));
                    break;

                default:
                    // Generic gauge for unknown metrics
                    $registry->getOrRegisterGauge(
                        'velora_' . $name,
                        'Frontend metric',
                        array_keys($labels)
                    )->set($value, array_values($labels));
            }
        } catch (\Exception $e) {
            \Log::warning('Failed to process frontend metric: ' . $e->getMessage());
        }
    }
}
