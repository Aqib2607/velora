<?php

namespace App\Http\Controllers;

use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlists = Wishlist::with('product')->where('user_id', $request->user()->id)->get();
        return response()->json(['data' => $wishlists]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $wishlist = Wishlist::firstOrCreate([
            'user_id' => $request->user()->id,
            'product_id' => $request->product_id
        ]);

        return response()->json(['message' => 'Added to wishlist', 'data' => $wishlist]);
    }

    public function destroy(Request $request, $productId)
    {
        Wishlist::where('user_id', $request->user()->id)->where('product_id', $productId)->delete();
        return response()->json(['message' => 'Removed from wishlist']);
    }
}
