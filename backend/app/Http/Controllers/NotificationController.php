<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Modules\Notification\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(private readonly NotificationService $notifications) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['status' => 'success', 'data' => $notifications]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notifications->unreadCount($request->user()->id);
        return response()->json(['status' => 'success', 'data' => ['count' => $count]]);
    }

    public function markRead(Notification $notification, Request $request): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }
        $notification->markAsRead();
        return response()->json(['status' => 'success']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $count = $this->notifications->markAllRead($request->user()->id);
        return response()->json(['status' => 'success', 'data' => ['marked' => $count]]);
    }
}
