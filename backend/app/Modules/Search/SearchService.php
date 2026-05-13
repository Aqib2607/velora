<?php

namespace App\Modules\Search;

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class SearchService
{
    /**
     * Search products with filtering and sorting.
     * In a real OpenSearch setup, this would build an OS query DSL.
     * Here we simulate it with Eloquent for the required filters.
     */
    public function search(array $params, int $tenantId): LengthAwarePaginator
    {
        $query = Product::where('tenant_id', $tenantId)
            ->where('status', 'published')
            ->with(['skus' => function ($q) {
                $q->withSum('inventory', 'quantity_available');
            }]);

        // Keyword search
        if (!empty($params['q'])) {
            $query->where(function ($q) use ($params) {
                $q->where('name', 'like', "%{$params['q']}%")
                  ->orWhere('description', 'like', "%{$params['q']}%");
            });
        }

        // Filters
        if (!empty($params['category'])) {
            $query->where('category_id', $params['category']);
        }
        
        if (!empty($params['brand'])) {
            $query->where('brand', $params['brand']);
        }

        if (isset($params['min_price'])) {
            $query->where('base_price', '>=', $params['min_price']);
        }

        if (isset($params['max_price'])) {
            $query->where('base_price', '<=', $params['max_price']);
        }
        
        if (!empty($params['rating'])) {
            $query->where('average_rating', '>=', $params['rating']);
        }

        if (!empty($params['region'])) {
            $query->whereJsonContains('available_regions', $params['region']);
        }

        // Sorting
        $sort = $params['sort'] ?? 'relevance';
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('base_price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('base_price', 'desc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'rating':
                $query->orderBy('average_rating', 'desc');
                break;
            case 'relevance':
            default:
                // Fallback to created_at for relevance in this DB-driven stub
                $query->orderBy('created_at', 'desc');
                break;
        }

        return $query->paginate($params['per_page'] ?? 24);
    }

    /**
     * Autocomplete suggestions for search bar.
     */
    public function autocomplete(string $term, int $tenantId): array
    {
        $products = Product::where('tenant_id', $tenantId)
            ->where('status', 'published')
            ->where('name', 'like', "%{$term}%")
            ->select('id', 'name', 'slug')
            ->limit(5)
            ->get();

        return [
            'products' => $products,
            'categories' => [] // Stub for category autocomplete
        ];
    }
}
