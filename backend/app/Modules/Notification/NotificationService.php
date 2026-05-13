<?php

namespace App\Modules\Notification;

use App\Models\Notification;

class NotificationService
{
    /**
     * Dispatch a notification to a specific user within a tenant.
     */
    public function send(int $userId, int $tenantId, string $type, string $title, string $body, array $data = [], string $channel = 'database'): Notification
    {
        return Notification::create([
            'tenant_id' => $tenantId,
            'user_id'   => $userId,
            'type'      => $type,
            'title'     => $title,
            'body'      => $body,
            'data'      => $data,
            'channel'   => $channel,
        ]);
    }

    /**
     * Get unread count for a user.
     */
    public function unreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllRead(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }
}
