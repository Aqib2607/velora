<?php

namespace App\Http\Controllers;

use App\Models\GiftCard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GiftCardController extends Controller
{
    public function __construct(private readonly \App\Modules\GiftCard\GiftCardService $service) {}

    public function index(Request $request): JsonResponse
    {
        $cards = GiftCard::where('purchaser_id', $request->user()->id)->get();
        return response()->json(['status' => 'success', 'data' => $cards]);
    }

    public function purchase(Request $request): JsonResponse
    {
        $request->validate(['amount' => 'required|numeric|min:5']);
        $card = $this->service->create(
            $request->user()->id, 
            app('tenant')->id, 
            $request->amount, 
            $request->currency ?? 'USD'
        );
        return response()->json(['status' => 'success', 'data' => $card]);
    }

    public function redeem(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string', 'amount' => 'required|numeric|min:0.01', 'reference' => 'required|string']);
        
        $result = $this->service->redeem(
            $request->code, 
            $request->amount, 
            $request->user()->id, 
            app('tenant')->id, 
            $request->reference
        );
        
        return response()->json(['status' => 'success', 'data' => $result['gift_card']]);
    }
}
