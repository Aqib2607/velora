<?php

namespace App\Http\Controllers\Api\Mobile;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class MobileApiController extends Controller
{
    /**
     * Issue long-lived refresh tokens for mobile clients.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required', 'password' => 'required', 'device_name' => 'required']);

        // Check credentials...
        // Assuming valid...
        $user = \App\Models\User::where('email', $request->email)->first();

        // Issue token
        $token = $user->createToken($request->device_name, ['*'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'token'  => $token,
            // Mobile specific metadata
            'config' => [
                'deep_link_base' => 'velora://app',
                'require_update' => false
            ]
        ]);
    }

    /**
     * Register device for FCM/APNs push notifications.
     */
    public function registerDevice(Request $request): JsonResponse
    {
        $request->validate(['fcm_token' => 'required|string', 'platform' => 'required|in:ios,android']);

        $request->user()->update([
            'push_token' => $request->fcm_token,
            'device_platform' => $request->platform
        ]);

        return response()->json(['status' => 'success']);
    }
}
