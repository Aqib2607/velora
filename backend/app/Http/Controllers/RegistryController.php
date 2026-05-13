<?php

namespace App\Http\Controllers;

use App\Models\Registry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RegistryController extends Controller
{
    public function __construct(private readonly \App\Modules\Registry\RegistryService $service) {}

    public function index(Request $request): JsonResponse
    {
        $registries = Registry::where('user_id', $request->user()->id)->get();
        return response()->json(['status' => 'success', 'data' => $registries]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'            => 'required|string', 
            'event_date'       => 'required|date',
            'event_type'       => 'nullable|string',
            'visibility'       => 'nullable|in:public,private,shared',
            'shipping_address' => 'nullable|array'
        ]);

        $registry = $this->service->create($request->user()->id, app('tenant')->id, $validated);

        return response()->json(['status' => 'success', 'data' => $registry]);
    }

    public function show(Registry $registry): JsonResponse
    {
        // Add basic visibility check if needed
        return response()->json(['status' => 'success', 'data' => $registry->load('items.product')]);
    }

    public function addItem(Registry $registry, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'integer|min:1',
            'notes'      => 'nullable|string'
        ]);

        $item = $this->service->addItem($registry, $validated['product_id'], $validated['quantity'] ?? 1, $validated['notes'] ?? null);

        return response()->json(['status' => 'success', 'data' => $item]);
    }
    
    public function purchaseItem(Request $request, int $itemId): JsonResponse
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $item = $this->service->purchaseItem($itemId, $validated['quantity'], app('tenant')->id);

        return response()->json(['status' => 'success', 'data' => $item]);
    }
}
