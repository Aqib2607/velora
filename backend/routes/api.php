<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AppConfigController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CurrencyController;
use App\Http\Controllers\DealController;
use App\Http\Controllers\GDPRController;
use App\Http\Controllers\GiftCardController;
use App\Http\Controllers\LedgerController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\PayoutController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RegionController;
use App\Http\Controllers\RegistryController;
use App\Http\Controllers\RefundController;
use App\Http\Controllers\SellerApplicationController;
use App\Http\Controllers\SellerController;
use App\Http\Controllers\SupportTicketController;
use App\Http\Controllers\WebhookController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\HomepageController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\CouponController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — Velora v1
|--------------------------------------------------------------------------
|
| Middleware stack per spec:
|   auth:sanctum + ResolveTenant + IdempotencyMiddleware + throttle:api
|
| Stripe webhook is excluded from auth (validated by signature).
|
*/

// ──────────────────────────────────────────────────────────
// Prometheus Metrics Endpoint (no auth required, internal only)
// ──────────────────────────────────────────────────────────
Route::get('/metrics', [MetricsController::class, 'metrics'])->withoutMiddleware(['throttle:api']);

// ──────────────────────────────────────────────────────────
// Public — Auth (requires tenant resolution only)
// ──────────────────────────────────────────────────────────
Route::prefix('v1')->middleware(['resolve.tenant', 'throttle:api'])->group(function () {

    // Frontend metrics collection (public, no auth required)
    Route::post('metrics', [MetricsController::class, 'receiveFrontendMetrics'])->withoutMiddleware(['throttle:api']);

    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login',    [AuthController::class, 'login']);
    });

    // Configuration & Metadata (Public)
    Route::get('config/app', [AppConfigController::class, 'index']);
    Route::get('regions',    [RegionController::class, 'index']);
    Route::get('currencies', [CurrencyController::class, 'index']);
    Route::get('deals',      [DealController::class, 'index']);
    Route::get('location/reverse-geocode', [LocationController::class, 'reverseGeocode']);

    // Catalog (Public browse — no auth required)
    Route::middleware('cache.api')->group(function () {
        Route::get('homepage',                    [HomepageController::class, 'index']);
        Route::get('catalog/products',            [ProductController::class, 'index']);
        Route::get('catalog/products/{product}',  [ProductController::class, 'show']);
        Route::get('catalog/categories',          [CategoryController::class, 'index']);
        Route::get('catalog/categories/{category}',[CategoryController::class, 'show']);
    });

    // Search (Public) - Cached for 60s
    Route::middleware('cache.api')->group(function () {
        Route::get('search',                 [SearchController::class, 'index']);
        Route::get('search/autocomplete',    [SearchController::class, 'autocomplete']);
        Route::get('search/popular',         [SearchController::class, 'popular']);
        Route::get('search/trending',        [SearchController::class, 'trending']);
    });

    // Search Analytics (Authenticated)
    Route::post('search/track-click',        [SearchController::class, 'trackClick'])
        ->middleware('auth:sanctum');

    // Stripe webhook — public but signature-validated
    Route::post('webhooks/stripe', [WebhookController::class, 'stripe'])
        ->withoutMiddleware(['throttle:api']);
});

// ──────────────────────────────────────────────────────────
// Authenticated Routes
// ──────────────────────────────────────────────────────────
Route::prefix('v1')->middleware([
    'auth:sanctum',
    'resolve.tenant',
    'idempotency',
    'audit.log',
    'throttle:api',
])->group(function () {

    // ── Auth & Profile
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me',      [AuthController::class, 'me']);
    
    Route::prefix('profile')->group(function () {
        Route::post('/',                 [UserController::class, 'updateProfile']);
        Route::post('/change-password',  [UserController::class, 'changePassword']);
    });

    // ── Catalog — write operations (authenticated)
    Route::prefix('catalog')->group(function () {
        Route::post('products',             [ProductController::class, 'store']);
        Route::patch('products/{product}',  [ProductController::class, 'update']);
        Route::delete('products/{product}', [ProductController::class, 'destroy']);

        Route::post('categories',              [CategoryController::class, 'store']);
        Route::patch('categories/{category}',  [CategoryController::class, 'update']);
        Route::delete('categories/{category}', [CategoryController::class, 'destroy']);
    });

    // ── Cart
    Route::prefix('cart')->group(function () {
        Route::get('/',               [CartController::class, 'show']);
        Route::post('items',          [CartController::class, 'addItem']);
        Route::put('items/{item}',    [CartController::class, 'updateItem']);
        Route::delete('items/{item}', [CartController::class, 'removeItem']);
        Route::delete('/',            [CartController::class, 'clear']);
        Route::post('coupon',         [CouponController::class, 'validateCoupon']);
    });

    // ── Wishlist
    Route::prefix('wishlist')->group(function () {
        Route::get('/',               [WishlistController::class, 'index']);
        Route::post('/',              [WishlistController::class, 'store']);
        Route::delete('/{product}',   [WishlistController::class, 'destroy']);
    });

    // ── Orders
    Route::prefix('orders')->group(function () {
        Route::get('/',                [OrderController::class, 'index']);
        Route::post('/',               [OrderController::class, 'store']);
        Route::get('/{order}',         [OrderController::class, 'show']);
        Route::post('/{order}/cancel', [OrderController::class, 'cancel']);
    });

    // ── Refunds
    Route::prefix('refunds')->group(function () {
        Route::get('/',                  [RefundController::class, 'index']);
        Route::post('/',                 [RefundController::class, 'store']);
        Route::post('/{refund}/approve', [RefundController::class, 'approve']);
        Route::post('/{refund}/reject',  [RefundController::class, 'reject']);
    });

    // ── Payouts
    Route::prefix('payouts')->group(function () {
        Route::get('/',  [PayoutController::class, 'index']);
        Route::post('/', [PayoutController::class, 'store']);
    });

    // ── Ledger (admin only — enforced via policy in controller)
    Route::prefix('ledger')->group(function () {
        Route::get('accounts',                   [LedgerController::class, 'accounts']);
        Route::get('transactions',               [LedgerController::class, 'transactions']);
        Route::get('transactions/{transaction}', [LedgerController::class, 'show']);
    });

    // ── Gift Cards
    Route::prefix('gift-cards')->group(function () {
        Route::get('/',         [GiftCardController::class, 'index']);
        Route::post('purchase', [GiftCardController::class, 'purchase']);
        Route::post('redeem',   [GiftCardController::class, 'redeem']);
    });

    // ── Registry
    Route::prefix('registry')->group(function () {
        Route::get('/',                  [RegistryController::class, 'index']);
        Route::post('/',                 [RegistryController::class, 'store']);
        Route::get('/{registry}',        [RegistryController::class, 'show']);
        Route::post('/{registry}/items', [RegistryController::class, 'addItem']);
    });

    // ── Support
    Route::prefix('support')->group(function () {
        Route::get('tickets',          [SupportTicketController::class, 'index']);
        Route::post('tickets',         [SupportTicketController::class, 'store']);
        Route::get('tickets/{ticket}', [SupportTicketController::class, 'show']);
    });

    // ── Seller Onboarding
    Route::prefix('seller')->group(function () {
        Route::post('apply',  [SellerApplicationController::class, 'store']);
        Route::get('status',  [SellerApplicationController::class, 'status']);
    });

    // ── Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',                              [NotificationController::class, 'index']);
        Route::get('/unread-count',                  [NotificationController::class, 'unreadCount']);
        Route::get('/statistics',                    [NotificationController::class, 'statistics']);
        Route::post('/mark-all-read',                [NotificationController::class, 'markAllRead']);
        Route::post('/{notification}/mark-read',     [NotificationController::class, 'markRead']);
        Route::delete('/{notification}',             [NotificationController::class, 'delete']);

        // Push subscriptions
        Route::post('/push/subscribe',               [NotificationController::class, 'subscribePush']);
        Route::post('/push/unsubscribe',             [NotificationController::class, 'unsubscribePush']);
        Route::get('/push/subscriptions',            [NotificationController::class, 'getPushSubscriptions']);
        Route::delete('/push/subscriptions/{subscription}', [NotificationController::class, 'deletePushSubscription']);
    });

    // ── GDPR (previously missing from routes!)
    Route::prefix('gdpr')->group(function () {
        Route::post('export',  [GDPRController::class, 'export']);
        Route::delete('account', [GDPRController::class, 'deleteAccount']);
    });

    // ── Admin (RBAC enforced inside controller)
    Route::prefix('admin')->group(function () {
        Route::get('users',                              [AdminController::class, 'users']);
        Route::post('users/{user}/suspend',              [AdminController::class, 'suspendUser']);
        Route::post('users/{user}/ban',                  [AdminController::class, 'banUser']);

        Route::get('products',                           [AdminController::class, 'products']);
        Route::post('products/{product}/suspend',        [AdminController::class, 'suspendProduct']);
        Route::delete('products/{product}',              [AdminController::class, 'deleteProduct']);

        Route::get('refunds',                            [AdminController::class, 'refunds']);

        Route::get('orders',                             [AdminController::class, 'orders']);
        Route::get('reports',                            [AdminController::class, 'reports']);
        Route::get('audit-logs',                         [AdminController::class, 'auditLogs']);
        Route::post('sellers/{application}/approve',     [AdminController::class, 'approveSeller']);
        Route::post('sellers/{application}/reject',      [AdminController::class, 'rejectSeller']);

        // Tenants
        Route::apiResource('tenants', TenantController::class);

        // Commissions
        Route::apiResource('commissions', CommissionController::class);

        // Analytics & Reports
        Route::prefix('analytics')->group(function () {
            Route::get('marketplace',       [AnalyticsController::class, 'marketplace']);
            Route::get('kpis',              [AnalyticsController::class, 'executiveKPIs']);
            Route::get('export/csv',        [AnalyticsController::class, 'exportCSV']);
            Route::get('export/json',       [AnalyticsController::class, 'exportJSON']);
        });
    });

    // ── Seller Dashboard (RBAC via SellerController::getSellerProfile)
    Route::prefix('seller-dashboard')->group(function () {
        Route::get('stats',    [SellerController::class, 'stats']);
        Route::get('products', [SellerController::class, 'products']);
        Route::get('orders',   [SellerController::class, 'orders']);
        Route::get('payouts',  [SellerController::class, 'payouts']);
        Route::post('stripe/onboard', [SellerController::class, 'onboardStripe']);

        // Seller analytics & reports
        Route::prefix('analytics')->group(function () {
            Route::get('/',         [AnalyticsController::class, 'seller']);
            Route::get('export/csv',[AnalyticsController::class, 'exportCSV']);
            Route::get('export/json',[AnalyticsController::class, 'exportJSON']);
        });
    });

    // ── Seller Product Management
    Route::prefix('seller-products')->group(function () {
        Route::post('/',           [SellerController::class, 'createProduct']);
        Route::patch('/{product}', [SellerController::class, 'updateProduct']);
        Route::delete('/{product}',[SellerController::class, 'deleteProduct']);
    });
});
