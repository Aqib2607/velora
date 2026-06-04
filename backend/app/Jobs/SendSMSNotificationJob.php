<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendSMSNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $phone,
        private readonly string $type,
        private readonly string $message,
        private readonly array $data = [],
    ) {
        $this->onQueue('notifications');
    }

    public function handle(): void
    {
        try {
            // Truncate message to 160 characters for SMS
            $smsMessage = substr($this->message, 0, 160);

            // TODO: Implement Twilio or AWS SNS integration
            // $twilio = new Client(env('TWILIO_ACCOUNT_SID'), env('TWILIO_AUTH_TOKEN'));
            // $twilio->messages->create(
            //     $this->phone,
            //     ['from' => env('TWILIO_PHONE')],
            //     $smsMessage
            // );

            Log::info("SMS notification queued", [
                'phone' => $this->phone,
                'type' => $this->type,
                'message' => $smsMessage,
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send SMS notification", [
                'phone' => $this->phone,
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            // Retry up to 3 times
            if ($this->attempts() < 3) {
                $this->release(300); // Retry after 5 minutes
            }
        }
    }
}
