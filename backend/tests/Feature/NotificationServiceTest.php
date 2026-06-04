<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\PushSubscription;
use App\Models\Tenant;
use App\Models\User;
use App\Modules\Notification\NotificationService;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    private NotificationService $notificationService;
    private Tenant $tenant;
    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->tenant = Tenant::factory()->create();
        $this->user = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $this->notificationService = $this->app->make(NotificationService::class);
    }

    /**
     * Test sending a basic notification to database
     */
    public function test_send_notification_to_database(): void
    {
        $notification = $this->notificationService->send(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            type: 'test.notification',
            title: 'Test Title',
            body: 'Test Body',
            data: ['key' => 'value'],
            channels: 'database'
        );

        $this->assertNotNull($notification);
        $this->assertEquals($this->user->id, $notification->user_id);
        $this->assertEquals($this->tenant->id, $notification->tenant_id);
        $this->assertEquals('test.notification', $notification->type);
        $this->assertEquals('Test Title', $notification->title);
        $this->assertEquals('Test Body', $notification->body);
        $this->assertNull($notification->read_at);
    }

    /**
     * Test sending to multiple channels
     */
    public function test_send_notification_to_multiple_channels(): void
    {
        $notification = $this->notificationService->send(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            type: 'order.confirmed',
            title: 'Order Confirmed',
            body: 'Your order has been confirmed',
            data: ['order_id' => 123],
            channels: ['database', 'email', 'push']
        );

        $this->assertNotNull($notification);
        $this->assertStringContainsString('database', $notification->channel);
        $this->assertStringContainsString('email', $notification->channel);
        $this->assertStringContainsString('push', $notification->channel);
    }

    /**
     * Test unread count
     */
    public function test_unread_notification_count(): void
    {
        // Create 3 unread notifications
        for ($i = 0; $i < 3; $i++) {
            $this->notificationService->send(
                userId: $this->user->id,
                tenantId: $this->tenant->id,
                type: 'test',
                title: 'Test ' . $i,
                body: 'Body ' . $i
            );
        }

        $unreadCount = $this->notificationService->unreadCount($this->user->id);
        $this->assertEquals(3, $unreadCount);
    }

    /**
     * Test marking all notifications as read
     */
    public function test_mark_all_notifications_as_read(): void
    {
        // Create 3 unread notifications
        for ($i = 0; $i < 3; $i++) {
            $this->notificationService->send(
                userId: $this->user->id,
                tenantId: $this->tenant->id,
                type: 'test',
                title: 'Test ' . $i,
                body: 'Body ' . $i
            );
        }

        $marked = $this->notificationService->markAllRead($this->user->id);
        $this->assertEquals(3, $marked);

        // Verify all are marked as read
        $unreadCount = $this->notificationService->unreadCount($this->user->id);
        $this->assertEquals(0, $unreadCount);
    }

    /**
     * Test sending order confirmation notification
     */
    public function test_send_order_confirmation_notification(): void
    {
        $orderData = [
            'order_id' => 'ORD-123',
            'total' => 99.99,
            'currency' => 'USD',
            'item_count' => 2,
        ];

        $this->notificationService->sendOrderConfirmation(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            orderData: $orderData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'order.confirmed')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('ORD-123', $notification->body);
        $this->assertEquals($orderData, $notification->data);
    }

    /**
     * Test sending refund approved notification
     */
    public function test_send_refund_approved_notification(): void
    {
        $refundData = [
            'refund_id' => 'REF-456',
            'amount' => 25.00,
            'currency' => 'USD',
        ];

        $this->notificationService->sendRefundApproved(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            refundData: $refundData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'refund.approved')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('refund', strtolower($notification->title));
    }

    /**
     * Test sending payout completed notification
     */
    public function test_send_payout_completed_notification(): void
    {
        $payoutData = [
            'payout_id' => 'PAYOUT-789',
            'amount' => 500.00,
            'currency' => 'USD',
        ];

        $this->notificationService->sendPayoutCompleted(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            payoutData: $payoutData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'payout.completed')
            ->first();

        $this->assertNotNull($notification);
        $this->assertStringContainsString('payout', strtolower($notification->title));
    }

    /**
     * Test sending support response notification
     */
    public function test_send_support_response_notification(): void
    {
        $ticketData = [
            'ticket_id' => 'TICKET-123',
            'preview' => 'Your issue has been resolved',
        ];

        $this->notificationService->sendSupportResponse(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            ticketData: $ticketData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'support.response')
            ->first();

        $this->assertNotNull($notification);
    }

    /**
     * Test sending promotional notification
     */
    public function test_send_promotion_notification(): void
    {
        $promotionData = [
            'title' => 'Flash Sale: 50% Off',
            'description' => 'Limited time offer on electronics',
            'discount_code' => 'FLASH50',
        ];

        $this->notificationService->sendPromotion(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            promotionData: $promotionData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'promotion.offer')
            ->first();

        $this->assertNotNull($notification);
    }

    /**
     * Test sending inventory alert notification
     */
    public function test_send_inventory_alert_notification(): void
    {
        $inventoryData = [
            'product_id' => 123,
            'product_name' => 'iPhone 15 Pro',
        ];

        $this->notificationService->sendInventoryAlert(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            inventoryData: $inventoryData
        );

        $notification = Notification::where('user_id', $this->user->id)
            ->where('type', 'inventory.alert')
            ->first();

        $this->assertNotNull($notification);
    }

    /**
     * Test sending bulk notifications
     */
    public function test_send_bulk_notifications(): void
    {
        $user2 = User::factory()->create(['tenant_id' => $this->tenant->id]);
        $user3 = User::factory()->create(['tenant_id' => $this->tenant->id]);

        $userIds = [$this->user->id, $user2->id, $user3->id];

        $results = $this->notificationService->sendBulk(
            userIds: $userIds,
            tenantId: $this->tenant->id,
            type: 'broadcast',
            title: 'Important Announcement',
            body: 'Please read this important message'
        );

        $this->assertCount(3, $results);
        $this->assertNotNull($results[$this->user->id]);
        $this->assertNotNull($results[$user2->id]);
        $this->assertNotNull($results[$user3->id]);
    }

    /**
     * Test notification model markAsRead
     */
    public function test_mark_notification_as_read(): void
    {
        $notification = $this->notificationService->send(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            type: 'test',
            title: 'Test',
            body: 'Test body'
        );

        $this->assertNull($notification->read_at);

        $notification->markAsRead();

        $this->assertNotNull($notification->read_at);
        $this->assertTrue($notification->isUnread() === false);
    }

    /**
     * Test notification isUnread check
     */
    public function test_notification_is_unread_check(): void
    {
        $notification = $this->notificationService->send(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            type: 'test',
            title: 'Test',
            body: 'Test body'
        );

        $this->assertTrue($notification->isUnread());

        $notification->markAsRead();
        $this->refresh($notification);

        $this->assertFalse($notification->isUnread());
    }

    /**
     * Test purging old notifications
     */
    public function test_purge_old_notifications(): void
    {
        // Create an old notification (91 days ago)
        Notification::create([
            'tenant_id' => $this->tenant->id,
            'user_id' => $this->user->id,
            'type' => 'test',
            'title' => 'Old Notification',
            'body' => 'This is old',
            'created_at' => now()->subDays(91),
        ]);

        // Create a recent notification
        $this->notificationService->send(
            userId: $this->user->id,
            tenantId: $this->tenant->id,
            type: 'test',
            title: 'Recent',
            body: 'Recent notification'
        );

        $deleted = $this->notificationService->purgeOldNotifications(90);

        $this->assertGreaterThan(0, $deleted);
        $this->assertDatabaseCount('notifications', 1);
    }

    /**
     * Test sending notification without user email (SMS fallback)
     */
    public function test_send_notification_handles_missing_email(): void
    {
        $userWithoutEmail = User::factory()->create([
            'tenant_id' => $this->tenant->id,
            'email' => null,
        ]);

        // Should not throw exception
        $this->notificationService->sendEmail(
            userId: $userWithoutEmail->id,
            type: 'test',
            title: 'Test',
            body: 'Test',
        );

        // Verify no error
        $this->assertTrue(true);
    }
}
