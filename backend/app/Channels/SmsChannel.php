<?php

namespace App\Channels;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class SmsChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        if (!method_exists($notification, 'toSms')) {
            return;
        }

        $message = $notification->toSms($notifiable);
        $phone = $notifiable->routeNotificationFor('sms') ?? $notifiable->phone_number;

        if (!$phone) {
            return;
        }

        // Logic to send SMS via Twilio/SNS would go here
        Log::info("Sending SMS to {$phone}: {$message}");
    }
}
