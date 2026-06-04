<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Modules\Search\OpenSearchService;
use Illuminate\Console\Command;

class IndexProductsCommand extends Command
{
    protected $signature = 'search:index-products {--tenant-id=}';
    protected $description = 'Index products into OpenSearch for full-text search';

    public function __construct(private readonly OpenSearchService $openSearch)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $tenantId = $this->option('tenant-id');

        if ($tenantId) {
            return $this->indexTenant($tenantId);
        }

        // Index all tenants
        $tenants = \App\Models\Tenant::pluck('id');

        foreach ($tenants as $id) {
            $this->indexTenant($id);
        }

        return self::SUCCESS;
    }

    private function indexTenant($tenantId): int
    {
        $this->info("Indexing products for tenant {$tenantId}...");

        try {
            // Create index with mappings
            $this->openSearch->createIndexMappings($tenantId);
            $this->info("Created index for tenant {$tenantId}");

            // Fetch products in batches
            $batchSize = 100;
            $products = Product::where('tenant_id', $tenantId)
                ->where('status', 'published')
                ->select(['id', 'tenant_id', 'name', 'description', 'category_id', 'brand', 'base_price', 'average_rating', 'available_regions', 'status', 'created_at', 'updated_at', 'popularity_score'])
                ->lazy();

            $batch = [];
            $count = 0;

            foreach ($products as $product) {
                $batch[] = $product->toArray();

                if (count($batch) >= $batchSize) {
                    $this->openSearch->bulkIndex($batch, $tenantId);
                    $count += count($batch);
                    $this->info("Indexed {$count} products");
                    $batch = [];
                }
            }

            // Index remaining products
            if (count($batch) > 0) {
                $this->openSearch->bulkIndex($batch, $tenantId);
                $count += count($batch);
            }

            $this->info("Successfully indexed {$count} products for tenant {$tenantId}");

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Failed to index products: {$e->getMessage()}");
            return self::FAILURE;
        }
    }
}
