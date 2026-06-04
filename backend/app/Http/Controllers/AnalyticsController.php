<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AnalyticsController extends Controller
{
    private AnalyticsService $analyticsService;

    public function __construct(AnalyticsService $analyticsService)
    {
        $this->analyticsService = $analyticsService;
    }

    /**
     * Seller analytics — revenue over time, top products, order volume.
     */
    public function seller(Request $request): JsonResponse
    {
        $tenant = app('tenant');
        $period = $request->get('period', '30d');
        [$from, $to] = $this->analyticsService->parsePeriod($period);

        $data = [
            'period'                => $period,
            'from'                  => $from->toDateString(),
            'to'                    => $to->toDateString(),
            'daily_revenue_trend'   => $this->analyticsService->getDailyRevenueTrend($tenant, $from, $to),
            'commission_trend'      => $this->analyticsService->getCommissionTrend($tenant, $from, $to),
            'top_products'          => $this->analyticsService->getTopProductsByGMV($tenant, $from, $to, 5),
            'commission_analytics'  => $this->analyticsService->getCommissionAnalytics($tenant, $from, $to),
            'payout_analytics'      => $this->analyticsService->getPayoutAnalytics($tenant, $from, $to),
        ];

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    /**
     * Admin/Marketplace analytics — GMV, revenue, commissions, refunds, payouts.
     */
    public function marketplace(Request $request): JsonResponse
    {
        $this->authorize('view-admin-analytics');

        $tenant = app('tenant');
        $period = $request->get('period', '30d');
        [$from, $to] = $this->analyticsService->parsePeriod($period);

        $data = [
            'period'                 => $period,
            'from'                   => $from->toDateString(),
            'to'                     => $to->toDateString(),
            'gmv'                    => $this->analyticsService->calculateGMV($tenant, $from, $to),
            'platform_revenue'       => $this->analyticsService->calculatePlatformRevenue($tenant, $from, $to),
            'seller_payouts'         => $this->analyticsService->calculateSellerPayouts($tenant, $from, $to),
            'refund_amount'          => $this->analyticsService->calculateRefunds($tenant, $from, $to),
            'daily_revenue_trend'    => $this->analyticsService->getDailyRevenueTrend($tenant, $from, $to),
            'commission_trend'       => $this->analyticsService->getCommissionTrend($tenant, $from, $to),
            'top_sellers'            => $this->analyticsService->getTopSellersByGMV($tenant, $from, $to, 10),
            'top_products'           => $this->analyticsService->getTopProductsByGMV($tenant, $from, $to, 10),
            'customer_analytics'     => $this->analyticsService->getCustomerAnalytics($tenant, $from, $to),
            'refund_analytics'       => $this->analyticsService->getRefundAnalytics($tenant, $from, $to),
            'commission_analytics'   => $this->analyticsService->getCommissionAnalytics($tenant, $from, $to),
            'payout_analytics'       => $this->analyticsService->getPayoutAnalytics($tenant, $from, $to),
        ];

        return response()->json(['status' => 'success', 'data' => $data]);
    }

    /**
     * Executive KPI dashboard — high-level business metrics
     */
    public function executiveKPIs(Request $request): JsonResponse
    {
        $this->authorize('view-admin-analytics');

        $tenant = app('tenant');
        $period = $request->get('period', '30d');
        [$from, $to] = $this->analyticsService->parsePeriod($period);

        $kpis = $this->analyticsService->getExecutiveKPIs($tenant, $from, $to);

        return response()->json(['status' => 'success', 'data' => $kpis]);
    }

    /**
     * Export analytics to CSV
     */
    public function exportCSV(Request $request): StreamedResponse
    {
        $this->authorize('export-analytics');

        $tenant = app('tenant');
        $period = $request->get('period', '30d');
        [$from, $to] = $this->analyticsService->parsePeriod($period);

        $kpis = $this->analyticsService->getExecutiveKPIs($tenant, $from, $to);

        $filename = "analytics_export_{$from->toDateString()}_to_{$to->toDateString()}.csv";

        $response = new StreamedResponse(function () use ($kpis) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Metric', 'Value']);

            // KPIs
            foreach ($kpis['kpis'] as $key => $value) {
                fputcsv($handle, [ucfirst(str_replace('_', ' ', $key)), $value]);
            }

            fputcsv($handle, ['']);
            fputcsv($handle, ['Top Sellers', '', 'GMV']);
            foreach ($kpis['top_sellers'] as $seller) {
                fputcsv($handle, [$seller->seller_name, '', $seller->gmv]);
            }

            fputcsv($handle, ['']);
            fputcsv($handle, ['Top Products', '', 'Units Sold', 'GMV']);
            foreach ($kpis['top_products'] as $product) {
                fputcsv($handle, [$product->product_name, '', $product->units_sold, $product->gmv]);
            }

            fclose($handle);
        }, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);

        return $response;
    }

    /**
     * Export analytics to JSON
     */
    public function exportJSON(Request $request): JsonResponse
    {
        $this->authorize('export-analytics');

        $tenant = app('tenant');
        $period = $request->get('period', '30d');
        [$from, $to] = $this->analyticsService->parsePeriod($period);

        $kpis = $this->analyticsService->getExecutiveKPIs($tenant, $from, $to);

        return response()->json([
            'status' => 'success',
            'export_date' => now()->toIso8601String(),
            'data' => $kpis,
        ]);
    }
}
