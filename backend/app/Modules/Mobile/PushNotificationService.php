<?php

namespace App\Modules\Mobile;

use App\Models\User;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    /**
     * Send a push notification to a user's registered device.
     */
    public function send(User $user, string $title, string $body, array $data = []): void
    {
        if (!$user->push_token) {
            return;
        }

        $payload = [
            'to' => $user->push_token,
            'notification' => [
                'title' => $title,
                'body'  => $body,
                'sound' => 'default'
            ],
            'data' => array_merge($data, [
                // Embed deep linking info
                'deep_link' => $data['link'] ?? 'velora://app/home'
            ])
        ];

        // Send to Firebase Cloud Messaging (FCM) or Apple Push Notification Service (APNs)
        // Log for now
        Log::info("Push Notification Sent to {$user->id}: {$title}", $payload);
    }
}
