<?php

namespace App\Http\Controllers;

use App\Services\EnhancedSearchService;
use App\Models\SearchAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SearchController extends Controller
{
    public function __construct(private readonly EnhancedSearchService $searchService) {}

    /**
     * Full-text search with advanced filtering
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q'         => 'nullable|string|max:500',
            'category'  => 'nullable|integer',
            'brand'     => 'nullable|string|max:100',
            'min_price' => 'nullable|numeric|min:0',
            'max_price' => 'nullable|numeric|min:0',
            'rating'    => 'nullable|numeric|between:0,5',
            'region'    => 'nullable|string|max:50',
            'sort'      => 'nullable|in:relevance,price_asc,price_desc,newest,rating,trending',
            'per_page'  => 'nullable|integer|between:1,100',
            'page'      => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $params = $validator->validated();
        $params['page'] = $request->get('page', 1);
        $params['per_page'] = $request->get('per_page', 24);

        $results = $this->searchService->search($params, app('tenant')->id);

        // Track search analytics
        $this->trackSearch(
            $params['q'] ?? '',
            app('tenant')->id,
            $results['total'] ?? 0,
            $request->session()->getId()
        );

        return response()->json([
            'status' => 'success',
            'data' => [
                'results' => $results['hits'] ?? [],
                'total' => $results['total'] ?? 0,
                'current_page' => $results['current_page'] ?? 1,
                'last_page' => $results['last_page'] ?? 1,
                'source' => $results['source'] ?? 'unknown',
                'facets' => $results['facets'] ?? [],
            ],
        ]);
    }

    /**
     * Autocomplete suggestions for search bar
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'q'     => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|between:1,50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $term = $request->get('q');
        $limit = $request->get('limit', 10);

        $results = $this->searchService->autocomplete($term, app('tenant')->id, $limit);

        return response()->json([
            'status' => 'success',
            'data' => $results,
        ]);
    }

    /**
     * Get popular searches for a marketplace
     */
    public function popular(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'days'  => 'nullable|integer|between:1,90',
            'limit' => 'nullable|integer|between:1,50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $days = $request->get('days', 7);
        $limit = $request->get('limit', 10);

        $popular = SearchAnalytics::where('tenant_id', app('tenant')->id)
            ->where('searched_at', '>=', now()->subDays($days))
            ->groupBy('query')
            ->selectRaw('query, COUNT(*) as count')
            ->orderByDesc('count')
            ->limit($limit)
            ->pluck('count', 'query');

        return response()->json([
            'status' => 'success',
            'data' => $popular,
        ]);
    }

    /**
     * Get trending searches
     */
    public function trending(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'limit' => 'nullable|integer|between:1,50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        $limit = $request->get('limit', 10);

        // Weight more recent searches higher
        $trending = SearchAnalytics::where('tenant_id', app('tenant')->id)
            ->where('searched_at', '>=', now()->subDays(1))
            ->groupBy('query')
            ->selectRaw('query, COUNT(*) as count, MAX(searched_at) as last_searched')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $trending->toArray(),
        ]);
    }

    /**
     * Track search click-through
     */
    public function trackClick(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query'      => 'required|string|max:500',
            'product_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'errors' => $validator->errors(),
            ], 422);
        }

        SearchAnalytics::where('tenant_id', app('tenant')->id)
            ->where('query', $request->get('query'))
            ->whereNull('clicked_at')
            ->latest()
            ->first()
            ?->update([
                'clicked_product_id' => $request->get('product_id'),
                'clicked_at' => now(),
            ]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Track a search query
     */
    private function trackSearch(string $query, int $tenantId, int $resultCount, string $sessionId): void
    {
        if (empty($query)) {
            return;
        }

        try {
            SearchAnalytics::create([
                'tenant_id' => $tenantId,
                'query' => $query,
                'result_count' => $resultCount,
                'session_id' => $sessionId,
                'user_id' => auth()->id(),
                'searched_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Fail silently to not impact search
            \Log::debug('Failed to track search', ['error' => $e->getMessage()]);
        }
    }
}
