<?php

namespace App\Observers;

use App\Models\Product;
use App\Modules\Search\OpenSearchService;
use Illuminate\Support\Facades\Log;

class ProductObserver
{
    private OpenSearchService $openSearch;

    public function __construct(OpenSearchService $openSearch)
    {
        $this->openSearch = $openSearch;
    }

    /**
     * Handle the Product "created" event.
     */
    public function created(Product $product): void
    {
        try {
            $this->openSearch->indexProduct($product->toArray());
        } catch (\Exception $e) {
            Log::error('Failed to index product on creation', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the Product "updated" event.
     */
    public function updated(Product $product): void
    {
        try {
            $this->openSearch->indexProduct($product->toArray());
        } catch (\Exception $e) {
            Log::error('Failed to index product on update', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the Product "deleted" event.
     */
    public function deleted(Product $product): void
    {
        try {
            $this->openSearch->deleteProduct($product->id, $product->tenant_id);
        } catch (\Exception $e) {
            Log::error('Failed to delete product from index', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the Product "restored" event.
     */
    public function restored(Product $product): void
    {
        try {
            $this->openSearch->indexProduct($product->toArray());
        } catch (\Exception $e) {
            Log::error('Failed to restore product index', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Handle the Product "force deleted" event.
     */
    public function forceDeleted(Product $product): void
    {
        try {
            $this->openSearch->deleteProduct($product->id, $product->tenant_id);
        } catch (\Exception $e) {
            Log::error('Failed to force delete product from index', [
                'product_id' => $product->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
