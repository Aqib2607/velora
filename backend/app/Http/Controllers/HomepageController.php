<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Category;
use App\Models\SellerProfile;
use App\Models\Order;
use Illuminate\Support\Facades\Cache;

class HomepageController extends Controller
{
    public function index()
    {
        // Cache the homepage response for 60 seconds to avoid hitting DB hard
        $data = Cache::remember('homepage_data', 60, function () {
            
            // 1. Marketplace Metrics
            $metrics = [
                'total_products' => Product::active()->count(),
                'active_sellers' => SellerProfile::where('status', 'approved')->count(),
                'countries_served' => 150, // Static baseline
                'total_orders' => Order::count(),
            ];

            // 2. Featured Categories
            $categories = Category::withCount(['products' => function ($q) {
                $q->active();
            }])->orderByDesc('products_count')->limit(7)->get();

            // 3. Featured Products (Trending & Recent)
            $recentProducts = Product::active()
                ->with(['sellerProfile', 'skus'])
                ->orderByDesc('created_at')
                ->limit(6)
                ->get()
                ->map(function ($p) {
                    $price = $p->skus->min('price') ?? 0;
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'slug' => $p->slug,
                        'image' => $p->thumbnail,
                        'price' => $price,
                        'rating' => $p->attributes['rating'] ?? 5.0,
                        'seller' => [
                            'company_name' => $p->sellerProfile->business_name ?? 'Unknown Seller'
                        ]
                    ];
                });

            $trendingProducts = Product::active()
                ->with(['sellerProfile', 'skus'])
                // Assuming we track trending by some column or fallback to random/recent
                ->inRandomOrder()
                ->limit(4)
                ->get()
                ->map(function ($p) {
                    $price = $p->skus->min('price') ?? 0;
                    return [
                        'id' => $p->id,
                        'name' => $p->name,
                        'slug' => $p->slug,
                        'image' => $p->thumbnail,
                        'price' => $price,
                        'rating' => $p->attributes['rating'] ?? 5.0,
                        'seller' => [
                            'company_name' => $p->sellerProfile->business_name ?? 'Unknown Seller'
                        ]
                    ];
                });

            // 4. Featured Sellers
            // Needs top 4 sellers with their item count and average rating
            $sellers = SellerProfile::where('status', 'approved')
                ->withCount(['user as products_count' => function ($query) {
                    // Assuming products count is actually mapped on seller_profile_id in products table
                    // We need to count products related to this seller_profile_id
                }])
                // To get actual products count, we can join or use addSelect
                ->withCount('user') // temporary hack, see below
                ->limit(4)
                ->get();
                
            // Correct products count for sellers:
            $sellers = SellerProfile::where('status', 'approved')
                ->withCount('commissionRecords') // fallback for something else
                ->limit(4)
                ->get()
                ->map(function($s) {
                    $count = Product::where('seller_profile_id', $s->id)->active()->count();
                    return [
                        'name' => $s->business_name,
                        'count' => $count,
                        'rating' => 5.0, // Hardcoded average or compute via reviews
                    ];
                });

            return [
                'metrics' => $metrics,
                'categories' => $categories->map(function($c) {
                    return [
                        'id' => $c->id,
                        'name' => $c->name,
                        'slug' => $c->slug,
                        'productCount' => $c->products_count
                    ];
                }),
                'recent_products' => $recentProducts,
                'trending_products' => $trendingProducts,
                'featured_sellers' => $sellers,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $data
        ]);
    }
}
