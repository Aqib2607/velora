<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\PushSubscription;
use App\Modules\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    /**
     * Get paginated notifications for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'nullable|string|max:50',
            'unread_only' => 'nullable|boolean',
            'per_page' => 'nullable|integer|between:1,100',
            'page' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        $query = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        if ($request->filled('type')) {
            $query->where('type', $request->get('type'));
        }

        $notifications = $query->paginate($request->get('per_page', 20));

        return response()->json([
            'status' => 'success',
            'data' => $notifications,
        ]);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notifications->unreadCount($request->user()->id);

        return response()->json([
            'status' => 'success',
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Mark single notification as read
     */
    public function markRead(Notification $notification, Request $request): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $notification->markAsRead();

        return response()->json(['status' => 'success']);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $count = $this->notifications->markAllRead($request->user()->id);

        return response()->json([
            'status' => 'success',
            'data' => ['marked' => $count],
        ]);
    }

    /**
     * Delete notification
     */
    public function delete(Notification $notification, Request $request): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $notification->delete();

        return response()->json(['status' => 'success']);
    }

    /**
     * Register push notification subscription
     */
    public function subscribePush(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'device_type' => 'required|in:ios,android,web',
            'device_token' => 'required|string|max:500',
            'endpoint' => 'nullable|string|max:500',
            'auth_key' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        try {
            $subscription = PushSubscription::updateOrCreate(
                [
                    'user_id' => $request->user()->id,
                    'device_token' => $request->get('device_token'),
                ],
                [
                    'device_type' => $request->get('device_type'),
                    'endpoint' => $request->get('endpoint'),
                    'auth_key' => $request->get('auth_key'),
                    'is_active' => true,
                ]
            );

            return response()->json([
                'status' => 'success',
                'data' => $subscription,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to register push subscription',
            ], 500);
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    public function unsubscribePush(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'device_token' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 422);
        }

        PushSubscription::where('user_id', $request->user()->id)
            ->where('device_token', $request->get('device_token'))
            ->update(['is_active' => false]);

        return response()->json(['status' => 'success']);
    }

    /**
     * Get user's push subscriptions
     */
    public function getPushSubscriptions(Request $request): JsonResponse
    {
        $subscriptions = PushSubscription::where('user_id', $request->user()->id)
            ->get(['id', 'device_type', 'is_active', 'created_at', 'last_used_at']);

        return response()->json([
            'status' => 'success',
            'data' => $subscriptions,
        ]);
    }

    /**
     * Delete push subscription
     */
    public function deletePushSubscription(PushSubscription $subscription, Request $request): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized');
        }

        $subscription->delete();

        return response()->json(['status' => 'success']);
    }

    /**
     * Get notification statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $stats = [
            'total' => Notification::where('user_id', $userId)->count(),
            'unread' => Notification::where('user_id', $userId)->whereNull('read_at')->count(),
            'by_type' => Notification::where('user_id', $userId)
                ->groupBy('type')
                ->selectRaw('type, COUNT(*) as count')
                ->pluck('count', 'type'),
            'by_channel' => Notification::where('user_id', $userId)
                ->groupBy('channel')
                ->selectRaw('channel, COUNT(*) as count')
                ->pluck('count', 'channel'),
        ];

        return response()->json([
            'status' => 'success',
            'data' => $stats,
        ]);
    }
}
