<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $products = Product::with(['category', 'skus.inventory', 'options.values', 'variants.optionValues', 'variants.inventory'])
            ->active()
            ->when($request->category_id, fn($q, $c) => $q->where('category_id', $c))
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'data'   => $product->load(['category', 'skus.inventory', 'sellerProfile', 'options.values', 'variants.optionValues', 'variants.inventory']),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return response()->json(['status' => 'success', 'data' => $product->load('skus')], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);
        $product->update($request->validated());

        return response()->json(['status' => 'success', 'data' => $product->fresh()]);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);
        $product->delete();

        return response()->json(['status' => 'success', 'data' => ['message' => 'Product deleted.']]);
    }
}
