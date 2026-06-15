<?php

namespace App\Services;

use App\Models\Product;
use App\Modules\Search\OpenSearchService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class EnhancedSearchService
{
    private OpenSearchService $openSearch;

    public function __construct(OpenSearchService $openSearch)
    {
        $this->openSearch = $openSearch;
    }

    /**
     * Advanced search with full-text, faceting, typo tolerance
     */
    public function search(array $params, int $tenantId): array
    {
        $cacheKey = $this->getCacheKey('search', $params, $tenantId);
        
        // Check cache
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $results = $this->performOpenSearchQuery($params, $tenantId);
        } catch (\Exception $e) {
            Log::warning('OpenSearch query failed, falling back to database', ['error' => $e->getMessage()]);
            $results = $this->performFallbackSearch($params, $tenantId);
        }

        // Cache for 5 minutes
        Cache::put($cacheKey, $results, now()->addMinutes(5));

        return $results;
    }

    /**
     * Execute OpenSearch query with advanced features
     */
    private function performOpenSearchQuery(array $params, int $tenantId): array
    {
        $query = $this->buildOpenSearchQuery($params, $tenantId);

        try {
            $results = $this->openSearch->search($query, $tenantId);

            return [
                'success' => true,
                'source' => 'opensearch',
                'hits' => $results['hits']['hits'] ?? [],
                'total' => $results['hits']['total']['value'] ?? 0,
                'current_page' => $params['page'] ?? 1,
                'last_page' => ceil(($results['hits']['total']['value'] ?? 0) / ($params['per_page'] ?? 24)),
                'facets' => $this->extractFacets($results),
            ];
        } catch (\Exception $e) {
            throw $e;
        }
    }

    /**
     * Build OpenSearch query DSL with all features
     */
    private function buildOpenSearchQuery(array $params, int $tenantId): array
    {
        $query = [
            'index' => 'velora_products_' . $tenantId,
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [],
                        'filter' => [
                            ['term' => ['status' => 'published']],
                        ],
                    ],
                ],
                'aggs' => $this->buildAggregations(),
                'size' => $params['per_page'] ?? 24,
                'from' => (($params['page'] ?? 1) - 1) * ($params['per_page'] ?? 24),
            ],
        ];

        // Full-text search with typo tolerance
        if (!empty($params['q'])) {
            $query['body']['query']['bool']['must'][] = [
                'multi_match' => [
                    'query'     => $params['q'],
                    'fields'    => ['name^2', 'description'],
                    'type'      => 'best_fields',
                    'fuzziness' => 'AUTO', // Enables typo tolerance
                    'prefix_length' => 0,
                    'max_expansions' => 50,
                ],
            ];
        }

        // Faceted filters
        if (!empty($params['category'])) {
            $query['body']['query']['bool']['filter'][] = ['term' => ['category_id' => $params['category']]];
        }

        if (!empty($params['brand'])) {
            $query['body']['query']['bool']['filter'][] = ['term' => ['brand' => $params['brand']]];
        }

        // Price range filter
        if (isset($params['min_price']) || isset($params['max_price'])) {
            $priceRange = [];
            if (isset($params['min_price'])) {
                $priceRange['gte'] = $params['min_price'];
            }
            if (isset($params['max_price'])) {
                $priceRange['lte'] = $params['max_price'];
            }
            $query['body']['query']['bool']['filter'][] = ['range' => ['base_price' => $priceRange]];
        }

        // Rating filter
        if (!empty($params['rating'])) {
            $query['body']['query']['bool']['filter'][] = ['range' => ['average_rating' => ['gte' => $params['rating']]]];
        }

        // Region filter
        if (!empty($params['region'])) {
            $query['body']['query']['bool']['filter'][] = ['term' => ['available_regions' => $params['region']]];
        }

        // Sorting
        $query['body']['sort'] = $this->buildSort($params['sort'] ?? 'relevance');

        return $query;
    }

    /**
     * Build aggregations for faceted filtering
     */
    private function buildAggregations(): array
    {
        return [
            'categories' => ['terms' => ['field' => 'category_id', 'size' => 20]],
            'brands' => ['terms' => ['field' => 'brand', 'size' => 20]],
            'price_ranges' => [
                'range' => [
                    'field' => 'base_price',
                    'ranges' => [
                        ['to' => 50],
                        ['from' => 50, 'to' => 100],
                        ['from' => 100, 'to' => 500],
                        ['from' => 500],
                    ],
                ],
            ],
            'ratings' => ['terms' => ['field' => 'average_rating', 'size' => 5]],
        ];
    }

    /**
     * Build sort criteria
     */
    private function buildSort(string $sort): array
    {
        return match ($sort) {
            'price_asc'     => [['base_price' => 'asc']],
            'price_desc'    => [['base_price' => 'desc']],
            'newest'        => [['created_at' => 'desc']],
            'rating'        => [['average_rating' => 'desc']],
            'relevance'     => ['_score'],
            'trending'      => [['popularity_score' => 'desc']],
            default         => ['_score'],
        };
    }

    /**
     * Extract facets from OpenSearch response
     */
    private function extractFacets(array $response): array
    {
        $aggs = $response['aggregations'] ?? [];

        return [
            'categories' => $aggs['categories']['buckets'] ?? [],
            'brands' => $aggs['brands']['buckets'] ?? [],
            'price_ranges' => $aggs['price_ranges']['buckets'] ?? [],
            'ratings' => $aggs['ratings']['buckets'] ?? [],
        ];
    }

    /**
     * Fallback to database search if OpenSearch unavailable
     */
    private function performFallbackSearch(array $params, int $tenantId): array
    {
        $query = Product::where('tenant_id', $tenantId)
            ->where('status', 'published');

        if (!empty($params['q'])) {
            $query->where(function ($q) use ($params) {
                $q->where('name', 'like', "%{$params['q']}%")
                  ->orWhere('description', 'like', "%{$params['q']}%");
            });
        }

        if (!empty($params['category'])) {
            $query->where('category_id', $params['category']);
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

        $results = $query->paginate($params['per_page'] ?? 24, ['*'], 'page', $params['page'] ?? 1);

        return [
            'success' => true,
            'source' => 'database',
            'hits' => $results->items(),
            'total' => $results->total(),
            'current_page' => $results->currentPage(),
            'last_page' => $results->lastPage(),
            'facets' => [],
        ];
    }

    /**
     * Autocomplete with suggestions and typo tolerance
     */
    public function autocomplete(string $term, int $tenantId, int $limit = 10): array
    {
        $cacheKey = $this->getCacheKey('autocomplete', ['q' => $term, 'limit' => $limit], $tenantId);

        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $results = $this->performOpenSearchAutocomplete($term, $tenantId, $limit);
        } catch (\Exception $e) {
            Log::warning('OpenSearch autocomplete failed', ['error' => $e->getMessage()]);
            $results = $this->performFallbackAutocomplete($term, $tenantId, $limit);
        }

        Cache::put($cacheKey, $results, now()->addMinutes(10));

        return $results;
    }

    /**
     * OpenSearch autocomplete with suggestions
     */
    private function performOpenSearchAutocomplete(string $term, int $tenantId, int $limit): array
    {
        $query = [
            'index' => 'velora_products_' . $tenantId,
            'body' => [
                'query' => [
                    'bool' => [
                        'must' => [
                            'match_phrase_prefix' => ['name' => ['query' => $term, 'boost' => 2]],
                        ],
                        'filter' => ['term' => ['status' => 'published']],
                    ],
                ],
                'size' => $limit,
            ],
        ];

        $results = $this->openSearch->search($query, $tenantId);
        $products = [];

        foreach ($results['hits']['hits'] as $hit) {
            $products[] = [
                'id' => $hit['_id'],
                'name' => $hit['_source']['name'],
                'category' => $hit['_source']['category_id'] ?? null,
            ];
        }

        return [
            'products' => $products,
            'categories' => $this->getSuggestedCategories($term, $tenantId),
            'suggestions' => $this->getSearchSuggestions($term, $tenantId),
        ];
    }

    /**
     * Fallback autocomplete using database
     */
    private function performFallbackAutocomplete(string $term, int $tenantId, int $limit): array
    {
        $products = Product::where('tenant_id', $tenantId)
            ->where('status', 'published')
            ->where('name', 'like', "%{$term}%")
            ->select('id', 'name', 'category_id')
            ->limit($limit)
            ->get()
            ->toArray();

        return [
            'products' => $products,
            'categories' => [],
            'suggestions' => [],
        ];
    }

    /**
     * Get suggested categories for autocomplete
     */
    private function getSuggestedCategories(string $term, int $tenantId): array
    {
        return [];  // Implement category suggestions
    }

    /**
     * Get search suggestions (popular searches, trending)
     */
    private function getSearchSuggestions(string $term, int $tenantId): array
    {
        return [];  // Implement based on search analytics
    }

    /**
     * Track search analytics
     */
    public function trackSearch(string $query, int $tenantId, int $resultCount): void
    {
        try {
            // TODO: Log search to analytics table
            // SearchAnalytics::create([
            //     'tenant_id' => $tenantId,
            //     'query' => $query,
            //     'result_count' => $resultCount,
            //     'searched_at' => now(),
            // ]);
        } catch (\Exception $e) {
            Log::error('Failed to track search', ['error' => $e->getMessage()]);
        }
    }

    /**
     * Get popular searches
     */
    public function getPopularSearches(int $tenantId, int $days = 7, int $limit = 10): Collection
    {
        // TODO: Implement based on SearchAnalytics table
        return collect();
    }

    /**
     * Get trending searches
     */
    public function getTrendingSearches(int $tenantId, int $limit = 10): Collection
    {
        // TODO: Implement based on SearchAnalytics table with time weighting
        return collect();
    }

    /**
     * Generate cache key
     */
    private function getCacheKey(string $type, array $params, int $tenantId): string
    {
        $paramHash = md5(json_encode($params));
        return "search:{$type}:{$tenantId}:{$paramHash}";
    }
}
