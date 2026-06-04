<?php

namespace App\Modules\Notification;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Dispatch a notification to a specific user within a tenant.
     * Supports multiple channels: database, email, sms, push
     */
    public function send(int $userId, int $tenantId, string $type, string $title, string $body, array $data = [], string|array $channels = 'database'): ?Notification
    {
        $channels = is_string($channels) ? [$channels] : $channels;

        // Always store in database for in-app notifications
        $notification = Notification::create([
            'tenant_id' => $tenantId,
            'user_id'   => $userId,
            'type'      => $type,
            'title'     => $title,
            'body'      => $body,
            'data'      => $data,
            'channel'   => implode(',', $channels),
        ]);

        // Dispatch to additional channels
        if (in_array('email', $channels)) {
            $this->sendEmail($userId, $type, $title, $body, $data);
        }

        if (in_array('sms', $channels)) {
            $this->sendSMS($userId, $type, $title, $body, $data);
        }

        if (in_array('push', $channels)) {
            $this->sendPush($userId, $type, $title, $body, $data);
        }

        return $notification;
    }

    /**
     * Send email notification via SendGrid/SES
     */
    public function sendEmail(int $userId, string $type, string $title, string $body, array $data = []): void
    {
        try {
            $user = User::find($userId);

            if (!$user || !$user->email) {
                Log::warning("Cannot send email notification to user {$userId}: no email");
                return;
            }

            Queue::dispatch(new \App\Jobs\SendEmailNotificationJob(
                email: $user->email,
                type: $type,
                title: $title,
                body: $body,
                data: $data,
            ));
        } catch (\Exception $e) {
            Log::error("Failed to queue email notification", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send SMS notification via Twilio
     */
    public function sendSMS(int $userId, string $type, string $title, string $body, array $data = []): void
    {
        try {
            $user = User::find($userId);

            if (!$user || !$user->phone) {
                Log::warning("Cannot send SMS notification to user {$userId}: no phone");
                return;
            }

            Queue::dispatch(new \App\Jobs\SendSMSNotificationJob(
                phone: $user->phone,
                type: $type,
                message: $title . ': ' . $body,
                data: $data,
            ));
        } catch (\Exception $e) {
            Log::error("Failed to queue SMS notification", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send push notification to mobile devices
     */
    public function sendPush(int $userId, string $type, string $title, string $body, array $data = []): void
    {
        try {
            Queue::dispatch(new \App\Jobs\SendPushNotificationJob(
                user_id: $userId,
                type: $type,
                title: $title,
                body: $body,
                data: $data,
            ));
        } catch (\Exception $e) {
            Log::error("Failed to queue push notification", [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Send bulk notification to multiple users
     */
    public function sendBulk(array $userIds, int $tenantId, string $type, string $title, string $body, array $data = [], string|array $channels = 'database'): array
    {
        $results = [];

        foreach ($userIds as $userId) {
            try {
                $results[$userId] = $this->send($userId, $tenantId, $type, $title, $body, $data, $channels);
            } catch (\Exception $e) {
                Log::error("Failed to send bulk notification", ['user_id' => $userId, 'error' => $e->getMessage()]);
                $results[$userId] = null;
            }
        }

        return $results;
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

    /**
     * Delete old notifications (older than 90 days)
     */
    public function purgeOldNotifications(int $days = 90): int
    {
        return Notification::where('created_at', '<', now()->subDays($days))
            ->delete();
    }

    /**
     * Send order confirmation notification
     */
    public function sendOrderConfirmation(int $userId, int $tenantId, array $orderData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'order.confirmed',
            title: 'Order Confirmed',
            body: "Your order #{$orderData['order_id']} has been confirmed. Total: {$orderData['currency']} {$orderData['total']}",
            data: $orderData,
            channels: ['database', 'email']
        );
    }

    /**
     * Send refund approved notification
     */
    public function sendRefundApproved(int $userId, int $tenantId, array $refundData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'refund.approved',
            title: 'Refund Approved',
            body: "Your refund of {$refundData['currency']} {$refundData['amount']} has been approved and will be processed within 5-10 business days.",
            data: $refundData,
            channels: ['database', 'email']
        );
    }

    /**
     * Send payout completed notification
     */
    public function sendPayoutCompleted(int $userId, int $tenantId, array $payoutData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'payout.completed',
            title: 'Payout Completed',
            body: "Your payout of {$payoutData['currency']} {$payoutData['amount']} has been successfully transferred.",
            data: $payoutData,
            channels: ['database', 'email']
        );
    }

    /**
     * Send support response notification
     */
    public function sendSupportResponse(int $userId, int $tenantId, array $ticketData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'support.response',
            title: 'New Support Response',
            body: "A support agent has responded to your ticket #{$ticketData['ticket_id']}: {$ticketData['preview']}",
            data: $ticketData,
            channels: ['database', 'email']
        );
    }

    /**
     * Send promotional notification
     */
    public function sendPromotion(int $userId, int $tenantId, array $promotionData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'promotion.offer',
            title: $promotionData['title'],
            body: $promotionData['description'],
            data: $promotionData,
            channels: ['database', 'push']
        );
    }

    /**
     * Send inventory alert notification
     */
    public function sendInventoryAlert(int $userId, int $tenantId, array $inventoryData): void
    {
        $this->send(
            userId: $userId,
            tenantId: $tenantId,
            type: 'inventory.alert',
            title: 'Product Back in Stock',
            body: "{$inventoryData['product_name']} is now back in stock.",
            data: $inventoryData,
            channels: ['database', 'push']
        );
    }
}

