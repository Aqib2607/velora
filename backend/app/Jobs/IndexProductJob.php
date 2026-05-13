<?php

namespace App\Jobs;

use App\Models\Product;
use App\Modules\Search\OpenSearchService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class IndexProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $productId) {}

    public function handle(OpenSearchService $searchService): void
    {
        $product = Product::find($this->productId);
        
        if (!$product) {
            return;
        }

        $searchService->indexProduct($product->toArray());
    }
}
