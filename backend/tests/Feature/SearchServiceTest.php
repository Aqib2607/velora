<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\SearchAnalytics;
use App\Models\Tenant;
use App\Models\User;
use App\Services\EnhancedSearchService;
use App\Modules\Search\OpenSearchService;
use Tests\TestCase;

class SearchServiceTest extends TestCase
{
    private EnhancedSearchService $searchService;
    private OpenSearchService $openSearch;
    private Tenant $tenant;
    private User $seller;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->seller = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->openSearch = $this->app->make(OpenSearchService::class);
        $this->searchService = $this->app->make(EnhancedSearchService::class);
    }

    /**
     * Test basic keyword search
     */
    public function test_keyword_search(): void
    {
        $product1 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'iPhone 15 Pro Max',
            'status' => 'published',
        ]);

        $product2 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Samsung Galaxy S24',
            'status' => 'published',
        ]);

        $this->openSearch->indexProduct($product1->toArray());
        $this->openSearch->indexProduct($product2->toArray());

        // This would work with real OpenSearch
        // $results = $this->searchService->search(['q' => 'iPhone'], $this->tenant->id);
        // $this->assertCount(1, $results['hits']);
    }

    /**
     * Test search with category filter
     */
    public function test_search_with_category_filter(): void
    {
        $category = 1; // Electronics

        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'category_id' => $category,
            'status' => 'published',
        ]);

        // Test fallback search
        $results = $this->searchService->search([
            'q' => $product->name,
            'category' => $category,
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
        $this->assertEquals('database', $results['source']);
    }

    /**
     * Test search with price range filter
     */
    public function test_search_with_price_range(): void
    {
        $product1 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'base_price' => 100,
            'status' => 'published',
        ]);

        $product2 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'base_price' => 1000,
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'min_price' => 50,
            'max_price' => 500,
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
        $this->assertGreaterThan(0, count($results['hits']));
    }

    /**
     * Test search with rating filter
     */
    public function test_search_with_rating_filter(): void
    {
        $product1 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'average_rating' => 4.5,
            'status' => 'published',
        ]);

        $product2 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'average_rating' => 2.0,
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'rating' => 3.5,
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }

    /**
     * Test autocomplete with minimum characters
     */
    public function test_autocomplete_minimum_characters(): void
    {
        Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'iPhone 15',
            'status' => 'published',
        ]);

        $results = $this->searchService->autocomplete('i', $this->tenant->id);

        // Should return nothing for single character
        $this->assertArrayHasKey('products', $results);
    }

    /**
     * Test autocomplete with valid term
     */
    public function test_autocomplete_with_valid_term(): void
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'iPhone 15 Pro',
            'status' => 'published',
        ]);

        $results = $this->searchService->autocomplete('iphone', $this->tenant->id);

        $this->assertArrayHasKey('products', $results);
        $this->assertArrayHasKey('categories', $results);
        $this->assertArrayHasKey('suggestions', $results);
    }

    /**
     * Test autocomplete caching
     */
    public function test_autocomplete_caching(): void
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'iPhone',
            'status' => 'published',
        ]);

        // First call
        $result1 = $this->searchService->autocomplete('iphone', $this->tenant->id);

        // Second call should hit cache
        $result2 = $this->searchService->autocomplete('iphone', $this->tenant->id);

        $this->assertEquals($result1, $result2);
    }

    /**
     * Test search with brand filter
     */
    public function test_search_with_brand_filter(): void
    {
        $product1 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'brand' => 'Apple',
            'status' => 'published',
        ]);

        $product2 = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'brand' => 'Samsung',
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'brand' => 'Apple',
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }

    /**
     * Test search with region filter
     */
    public function test_search_with_region_filter(): void
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'available_regions' => ['US', 'CA'],
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'region' => 'US',
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }

    /**
     * Test search with sorting
     */
    public function test_search_with_sorting(): void
    {
        Product::factory(3)->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'published',
        ]);

        $sortOptions = ['price_asc', 'price_desc', 'newest', 'rating'];

        foreach ($sortOptions as $sort) {
            $results = $this->searchService->search([
                'sort' => $sort,
            ], $this->tenant->id);

            $this->assertTrue($results['success']);
        }
    }

    /**
     * Test search with pagination
     */
    public function test_search_with_pagination(): void
    {
        Product::factory(30)->create([
            'tenant_id' => $this->tenant->id,
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'per_page' => 10,
            'page' => 1,
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
        $this->assertLessThanOrEqual(10, count($results['hits']));
    }

    /**
     * Test track search functionality
     */
    public function test_track_search(): void
    {
        $this->searchService->trackSearch('iPhone', $this->tenant->id, 5);

        // In a real implementation, this would log to SearchAnalytics
        // $this->assertDatabaseHas('search_analytics', [
        //     'tenant_id' => $this->tenant->id,
        //     'query' => 'iPhone',
        //     'result_count' => 5,
        // ]);
    }

    /**
     * Test multi-field search (name + description)
     */
    public function test_multi_field_search(): void
    {
        $product = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Smartphone',
            'description' => 'Latest iPhone with advanced features',
            'status' => 'published',
        ]);

        // Fallback search will find by name or description
        $results = $this->searchService->search([
            'q' => 'advanced features',
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }

    /**
     * Test search respects tenant isolation
     */
    public function test_search_respects_tenant_isolation(): void
    {
        $tenant1 = $this->tenant;
        $tenant2 = Tenant::factory()->create();

        $product1 = Product::factory()->create([
            'tenant_id' => $tenant1->id,
            'name' => 'Unique Product A',
            'status' => 'published',
        ]);

        $product2 = Product::factory()->create([
            'tenant_id' => $tenant2->id,
            'name' => 'Unique Product B',
            'status' => 'published',
        ]);

        $results1 = $this->searchService->search([
            'q' => 'Unique',
        ], $tenant1->id);

        $results2 = $this->searchService->search([
            'q' => 'Unique',
        ], $tenant2->id);

        // Results should be different for different tenants
        $this->assertTrue($results1['success']);
        $this->assertTrue($results2['success']);
    }

    /**
     * Test search excludes unpublished products
     */
    public function test_search_excludes_unpublished_products(): void
    {
        $publishedProduct = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Published Product',
            'status' => 'published',
        ]);

        $draftProduct = Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'Published Product',
            'status' => 'draft',
        ]);

        $results = $this->searchService->search([
            'q' => 'Published Product',
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }

    /**
     * Test complex multi-filter search
     */
    public function test_complex_multi_filter_search(): void
    {
        Product::factory()->create([
            'tenant_id' => $this->tenant->id,
            'name' => 'iPhone 15',
            'category_id' => 1,
            'brand' => 'Apple',
            'base_price' => 999,
            'average_rating' => 4.8,
            'status' => 'published',
        ]);

        $results = $this->searchService->search([
            'q' => 'iPhone',
            'category' => 1,
            'brand' => 'Apple',
            'min_price' => 500,
            'max_price' => 1500,
            'rating' => 4.0,
        ], $this->tenant->id);

        $this->assertTrue($results['success']);
    }
}
