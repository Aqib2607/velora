<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $orderId;

    public function __construct(string $orderId)
    {
        $this->orderId = $orderId;
    }

    public function via($notifiable)
    {
        return ['mail', 'database', \App\Channels\SmsChannel::class, \App\Channels\PushChannel::class]; 
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Order Confirmation: ' . $this->orderId)
                    ->greeting('Hello ' . $notifiable->name . ',')
                    ->line('Your order has been confirmed and is being processed.')
                    ->action('View Order', url('/orders/' . $this->orderId))
                    ->line('Thank you for shopping with Velora!');
    }

    public function toDatabase($notifiable)
    {
        return [
            'type' => 'order_confirmed',
            'order_id' => $this->orderId,
            'message' => 'Your order has been confirmed.',
            'url' => '/orders/' . $this->orderId,
        ];
    }

    public function toSms($notifiable)
    {
        return "Velora: Your order {$this->orderId} has been confirmed!";
    }

    public function toPush($notifiable)
    {
        return [
            'title' => 'Order Confirmed',
            'body' => "Your order {$this->orderId} is being processed.",
            'icon' => '/icons/order.png',
            'click_action' => '/orders/' . $this->orderId,
        ];
    }
}
