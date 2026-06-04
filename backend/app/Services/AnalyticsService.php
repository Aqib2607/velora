<?php

namespace App\Services;

use App\Models\Commission;
use App\Models\CommissionRecord;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payout;
use App\Models\Refund;
use App\Models\SellerProfile;
use App\Models\Tenant;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Calculate GMV (Gross Merchandise Value) for period
     */
    public function calculateGMV(Tenant $tenant, Carbon $from, Carbon $to): float
    {
        return Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('total_amount');
    }

    /**
     * Calculate platform revenue (commission collected)
     */
    public function calculatePlatformRevenue(Tenant $tenant, Carbon $from, Carbon $to): float
    {
        return CommissionRecord::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->sum('commission_amount');
    }

    /**
     * Calculate seller payouts for period
     */
    public function calculateSellerPayouts(Tenant $tenant, Carbon $from, Carbon $to): float
    {
        return Payout::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->sum('amount');
    }

    /**
     * Calculate refunds for period
     */
    public function calculateRefunds(Tenant $tenant, Carbon $from, Carbon $to): float
    {
        return Refund::where('tenant_id', $tenant->id)
            ->where('status', 'processed')
            ->whereBetween('processed_at', [$from, $to])
            ->sum('amount');
    }

    /**
     * Get daily revenue trends
     */
    public function getDailyRevenueTrend(Tenant $tenant, Carbon $from, Carbon $to): Collection
    {
        return Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_amount) as gmv'),
                DB::raw('COUNT(*) as order_count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get commission trend by day
     */
    public function getCommissionTrend(Tenant $tenant, Carbon $from, Carbon $to): Collection
    {
        return CommissionRecord::where('tenant_id', $tenant->id)
            ->whereBetween('created_at', [$from, $to])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(commission_amount) as total_commission'),
                DB::raw('COUNT(*) as order_count'),
                DB::raw('AVG(commission_amount) as avg_commission')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get top sellers by GMV
     */
    public function getTopSellersByGMV(Tenant $tenant, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        return OrderItem::where('tenant_id', $tenant->id)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('users', 'order_items.seller_id', '=', 'users.id')
            ->where('orders.status', 'paid')
            ->whereBetween('order_items.created_at', [$from, $to])
            ->select(
                'users.id as seller_id',
                'users.name as seller_name',
                DB::raw('SUM(order_items.subtotal) as gmv'),
                DB::raw('COUNT(DISTINCT orders.id) as order_count'),
                DB::raw('AVG(order_items.quantity) as avg_items_per_order')
            )
            ->groupBy('users.id', 'users.name')
            ->orderByDesc('gmv')
            ->limit($limit)
            ->get();
    }

    /**
     * Get top products by sales
     */
    public function getTopProductsByGMV(Tenant $tenant, Carbon $from, Carbon $to, int $limit = 10): Collection
    {
        return OrderItem::where('tenant_id', $tenant->id)
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'paid')
            ->whereBetween('order_items.created_at', [$from, $to])
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.sku',
                DB::raw('SUM(order_items.quantity) as units_sold'),
                DB::raw('SUM(order_items.subtotal) as gmv'),
                DB::raw('AVG(order_items.unit_price) as avg_price')
            )
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('gmv')
            ->limit($limit)
            ->get();
    }

    /**
     * Get customer analytics
     */
    public function getCustomerAnalytics(Tenant $tenant, Carbon $from, Carbon $to): array
    {
        $totalCustomers = User::where('tenant_id', $tenant->id)
            ->where('role', 'buyer')
            ->count();

        $newCustomers = User::where('tenant_id', $tenant->id)
            ->where('role', 'buyer')
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $returningCustomers = Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->select('customer_id')
            ->groupBy('customer_id')
            ->havingRaw('COUNT(*) > 1')
            ->count();

        $avgCustomerLifetimeValue = Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->select('customer_id')
            ->selectRaw('SUM(total_amount) as ltv')
            ->groupBy('customer_id')
            ->avg('ltv') ?? 0;

        return [
            'total_customers'          => $totalCustomers,
            'new_customers'            => $newCustomers,
            'returning_customers'      => $returningCustomers,
            'customer_retention_rate'  => $totalCustomers > 0 ? round(($returningCustomers / $totalCustomers) * 100, 2) : 0,
            'avg_customer_ltv'         => round($avgCustomerLifetimeValue, 2),
        ];
    }

    /**
     * Get refund analytics
     */
    public function getRefundAnalytics(Tenant $tenant, Carbon $from, Carbon $to): array
    {
        $totalRefunds = Refund::where('tenant_id', $tenant->id)
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $processedRefunds = Refund::where('tenant_id', $tenant->id)
            ->where('status', 'processed')
            ->whereBetween('processed_at', [$from, $to])
            ->count();

        $refundAmount = Refund::where('tenant_id', $tenant->id)
            ->where('status', 'processed')
            ->whereBetween('processed_at', [$from, $to])
            ->sum('amount');

        $avgRefundAmount = $processedRefunds > 0 ? $refundAmount / $processedRefunds : 0;

        $refundRate = Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->count();
        $refundRate = $refundRate > 0 ? ($processedRefunds / $refundRate) * 100 : 0;

        return [
            'total_refund_requests' => $totalRefunds,
            'processed_refunds'     => $processedRefunds,
            'total_refund_amount'   => round($refundAmount, 2),
            'avg_refund_amount'     => round($avgRefundAmount, 2),
            'refund_rate_percent'   => round($refundRate, 2),
        ];
    }

    /**
     * Get payout analytics
     */
    public function getPayoutAnalytics(Tenant $tenant, Carbon $from, Carbon $to): array
    {
        $completedPayouts = Payout::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->count();

        $totalPayoutAmount = Payout::where('tenant_id', $tenant->id)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to])
            ->sum('amount');

        $avgPayoutAmount = $completedPayouts > 0 ? $totalPayoutAmount / $completedPayouts : 0;

        $pendingPayouts = Payout::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->sum('amount');

        $failedPayouts = Payout::where('tenant_id', $tenant->id)
            ->where('status', 'failed')
            ->count();

        return [
            'completed_payouts'  => $completedPayouts,
            'total_payout_amount'=> round($totalPayoutAmount, 2),
            'avg_payout_amount'  => round($avgPayoutAmount, 2),
            'pending_payouts'    => round($pendingPayouts, 2),
            'failed_payouts'     => $failedPayouts,
        ];
    }

    /**
     * Get commission analytics
     */
    public function getCommissionAnalytics(Tenant $tenant, Carbon $from, Carbon $to): array
    {
        $totalCommissions = CommissionRecord::where('tenant_id', $tenant->id)
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $paidCommissions = CommissionRecord::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->sum('commission_amount');

        $pendingCommissions = CommissionRecord::where('tenant_id', $tenant->id)
            ->where('status', 'pending')
            ->sum('commission_amount');

        $avgCommission = $totalCommissions > 0 ? ($paidCommissions + $pendingCommissions) / $totalCommissions : 0;

        return [
            'total_commissions'    => $totalCommissions,
            'paid_commissions'     => round($paidCommissions, 2),
            'pending_commissions'  => round($pendingCommissions, 2),
            'total_commission_value' => round($paidCommissions + $pendingCommissions, 2),
            'avg_commission_per_order' => round($avgCommission, 2),
        ];
    }

    /**
     * Get executive KPI dashboard data
     */
    public function getExecutiveKPIs(Tenant $tenant, Carbon $from, Carbon $to): array
    {
        $gmv = $this->calculateGMV($tenant, $from, $to);
        $revenue = $this->calculatePlatformRevenue($tenant, $from, $to);
        $payouts = $this->calculateSellerPayouts($tenant, $from, $to);
        $refunds = $this->calculateRefunds($tenant, $from, $to);

        $orderCount = Order::where('tenant_id', $tenant->id)
            ->where('status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $topSellers = $this->getTopSellersByGMV($tenant, $from, $to, 5);
        $topProducts = $this->getTopProductsByGMV($tenant, $from, $to, 5);
        $customerAnalytics = $this->getCustomerAnalytics($tenant, $from, $to);
        $refundAnalytics = $this->getRefundAnalytics($tenant, $from, $to);
        $commissionAnalytics = $this->getCommissionAnalytics($tenant, $from, $to);

        return [
            'period'             => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'kpis'               => [
                'gmv'                 => round($gmv, 2),
                'platform_revenue'    => round($revenue, 2),
                'seller_payouts'      => round($payouts, 2),
                'refund_amount'       => round($refunds, 2),
                'net_margin'          => round(($revenue - $refunds) / max($gmv, 1) * 100, 2),
                'order_count'         => $orderCount,
                'avg_order_value'     => $orderCount > 0 ? round($gmv / $orderCount, 2) : 0,
            ],
            'top_sellers'        => $topSellers,
            'top_products'       => $topProducts,
            'customer_analytics' => $customerAnalytics,
            'refund_analytics'   => $refundAnalytics,
            'commission_analytics' => $commissionAnalytics,
        ];
    }

    /**
     * Helper: parse period string to dates
     */
    public function parsePeriod(string $period): array
    {
        $to = now();
        $from = match ($period) {
            '7d'  => $to->clone()->subDays(7),
            '30d' => $to->clone()->subDays(30),
            '90d' => $to->clone()->subDays(90),
            '12m' => $to->clone()->subMonths(12),
            default => $to->clone()->subDays(30),
        };

        return [$from, $to];
    }
}
