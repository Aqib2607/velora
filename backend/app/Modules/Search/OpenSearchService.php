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
                // Add n-gram edge tokens here if mapping supports it
            ]
        ];

        $this->client->index($params);
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
