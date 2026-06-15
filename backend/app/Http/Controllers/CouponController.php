<?php

namespace App\Http\Controllers;

use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_value' => 'nullable|numeric'
        ]);

        $coupon = Coupon::where('code', $request->code)->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid coupon code'], 404);
        }

        if (!$coupon->isValid($request->order_value ?? 0)) {
            return response()->json(['message' => 'Coupon is expired or not valid for this order'], 400);
        }

        return response()->json(['message' => 'Coupon applied', 'data' => $coupon]);
    }
}
