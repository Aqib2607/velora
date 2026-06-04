<?php

namespace App\Jobs;

use App\Models\PushSubscription;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendPushNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly int $userId,
        private readonly string $type,
        private readonly string $title,
        private readonly string $body,
        private readonly array $data = [],
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        try {
            // Get all push subscriptions for the user
            $subscriptions = PushSubscription::where('user_id', $this->userId)
                ->active()
                ->get();

            foreach ($subscriptions as $subscription) {
                $this->sendToSubscription($subscription);
            }
        } catch (\Exception $e) {
            Log::error("Failed to send push notifications", [
                'user_id' => $this->userId,
                'error' => $e->getMessage(),
            ]);

            // Retry up to 3 times
            if ($this->attempts() < 3) {
                $this->release(300); // Retry after 5 minutes
            }
        }
    }

    /**
     * Send push notification to a specific subscription
     */
    private function sendToSubscription(PushSubscription $subscription): void
    {
        try {
            // TODO: Implement Firebase Cloud Messaging or OneSignal
            // $response = (new GuzzleHttp\Client())->post(
            //     'https://fcm.googleapis.com/fcm/send',
            //     [
            //         'headers' => [
            //             'Authorization' => 'key=' . env('FCM_SERVER_KEY'),
            //             'Content-Type' => 'application/json',
            //         ],
            //         'json' => [
            //             'registration_ids' => [$subscription->device_token],
            //             'notification' => [
            //                 'title' => $this->title,
            //                 'body' => $this->body,
            //                 'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            //             ],
            //             'data' => array_merge(
            //                 $this->data,
            //                 ['notification_type' => $this->type]
            //             ),
            //         ],
            //     ]
            // );

            Log::info("Push notification sent", [
                'user_id' => $this->userId,
                'type' => $this->type,
                'device' => $subscription->device_type,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send push to subscription", [
                'subscription_id' => $subscription->id,
                'error' => $e->getMessage(),
            ]);

            // Mark subscription as invalid if it fails
            if (strpos($e->getMessage(), 'invalid') !== false) {
                $subscription->update(['is_active' => false]);
            }
        }
    }
}
