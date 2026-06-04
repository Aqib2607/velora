<?php

namespace App\Modules\Search;

use OpenSearch\Client;
use OpenSearch\ClientBuilder;

class OpenSearchService
{
    private Client $client;

    public function __construct()
    {
        $this->client = (new ClientBuilder())
            ->setHosts([env('OPENSEARCH_HOST', 'opensearch') . ':' . env('OPENSEARCH_PORT', 9200)])
            ->setBasicAuthentication(env('OPENSEARCH_USER', 'admin'), env('OPENSEARCH_PASS', 'admin'))
            ->setSSLVerification(false)
            ->build();
    }

    /**
     * Index a product for full-text search
     */
    public function indexProduct(array $productData): void
    {
        $params = [
            'index' => 'velora_products_' . $productData['tenant_id'],
            'id'    => $productData['id'],
            'body'  => [
                'name'              => $productData['name'],
                'description'       => $productData['description'],
                'category_id'       => $productData['category_id'],
                'brand'             => $productData['brand'],
                'base_price'        => (float) $productData['base_price'],
                'average_rating'    => (float) $productData['average_rating'],
                'available_regions' => $productData['available_regions'],
                'status'            => $productData['status'],
                'created_at'        => $productData['created_at'],
                'updated_at'        => $productData['updated_at'] ?? now()->toIso8601String(),
                'seller_id'         => $productData['seller_id'] ?? null,
                'popularity_score'  => $productData['popularity_score'] ?? 0,
            ]
        ];

        $this->client->index($params);
    }

    /**
     * Delete product from index
     */
    public function deleteProduct(int $productId, int $tenantId): void
    {
        $params = [
            'index' => 'velora_products_' . $tenantId,
            'id'    => $productId,
        ];

        try {
            $this->client->delete($params);
        } catch (\Exception $e) {
            // Product may not exist in index
        }
    }

    /**
     * Execute search query
     */
    public function search(array $query, int $tenantId): array
    {
        return $this->client->search($query);
    }

    /**
     * Bulk index products for initial population
     */
    public function bulkIndex(array $products, int $tenantId): array
    {
        $body = [];

        foreach ($products as $product) {
            $body[] = ['index' => ['_index' => 'velora_products_' . $tenantId, '_id' => $product['id']]];
            $body[] = [
                'name'              => $product['name'],
                'description'       => $product['description'],
                'category_id'       => $product['category_id'],
                'brand'             => $product['brand'],
                'base_price'        => (float) $product['base_price'],
                'average_rating'    => (float) $product['average_rating'],
                'available_regions' => $product['available_regions'],
                'status'            => $product['status'],
                'created_at'        => $product['created_at'],
                'popularity_score'  => $product['popularity_score'] ?? 0,
            ];
        }

        return $this->client->bulk(['body' => $body]);
    }

    /**
     * Check if product exists in index
     */
    public function exists(int $productId, int $tenantId): bool
    {
        return $this->client->exists([
            'index' => 'velora_products_' . $tenantId,
            'id'    => $productId,
        ]);
    }

    public function createIndexMappings(int $tenantId): void
    {
        $indexName = 'velora_products_' . $tenantId;

        $params = [
            'index' => $indexName,
            'body' => [
                'settings' => [
                    'analysis' => [
                        'analyzer' => [
                            'autocomplete' => [
                                'tokenizer' => 'autocomplete',
                                'filter' => ['lowercase']
                            ],
                            'autocomplete_search' => [
                                'tokenizer' => 'lowercase'
                            ]
                        ],
                        'tokenizer' => [
                            'autocomplete' => [
                                'type' => 'edge_ngram',
                                'min_gram' => 2,
                                'max_gram' => 20,
                                'token_chars' => ['letter', 'digit']
                            ]
                        ]
                    ]
                ],
                'mappings' => [
                    'properties' => [
                        'name'              => ['type' => 'text', 'analyzer' => 'autocomplete', 'search_analyzer' => 'autocomplete_search'],
                        'description'       => ['type' => 'text'],
                        'category_id'       => ['type' => 'keyword'],
                        'brand'             => ['type' => 'keyword'],
                        'base_price'        => ['type' => 'double'],
                        'average_rating'    => ['type' => 'double'],
                        'available_regions' => ['type' => 'keyword'],
                        'status'            => ['type' => 'keyword'],
                        'created_at'        => ['type' => 'date']
                    ]
                ]
            ]
        ];

        if (!$this->client->indices()->exists(['index' => $indexName])) {
            $this->client->indices()->create($params);
        }
    }
}
