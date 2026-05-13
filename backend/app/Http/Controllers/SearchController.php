<?php

namespace App\Http\Controllers;

use App\Modules\Search\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(private readonly SearchService $searchService) {}

    public function index(Request $request): JsonResponse
    {
        $params = $request->only([
            'q', 'category', 'brand', 'min_price', 'max_price', 'rating', 'region', 'sort', 'per_page'
        ]);

        $results = $this->searchService->search($params, app('tenant')->id);

        return response()->json(['status' => 'success', 'data' => $results]);
    }

    public function autocomplete(Request $request): JsonResponse
    {
        $term = $request->get('q', '');
        
        if (strlen($term) < 2) {
            return response()->json(['status' => 'success', 'data' => ['products' => [], 'categories' => []]]);
        }

        $results = $this->searchService->autocomplete($term, app('tenant')->id);

        return response()->json(['status' => 'success', 'data' => $results]);
    }
}
