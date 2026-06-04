<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendEmailNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $email,
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
            $templateClass = $this->getEmailTemplate($this->type);

            if ($templateClass) {
                Mail::send($templateClass, [
                    'title' => $this->title,
                    'body' => $this->body,
                    'data' => $this->data,
                ], function ($message) {
                    $message->to($this->email)
                        ->subject($this->title);
                });
            }
        } catch (\Exception $e) {
            Log::error("Failed to send email notification", [
                'email' => $this->email,
                'type' => $this->type,
                'error' => $e->getMessage(),
            ]);

            // Retry up to 3 times
            if ($this->attempts() < 3) {
                $this->release(300); // Retry after 5 minutes
            }
        }
    }

    /**
     * Map notification type to email template
     */
    private function getEmailTemplate(string $type): ?string
    {
        return match ($type) {
            'order.confirmed' => \App\Mail\OrderConfirmedMail::class,
            'refund.approved' => \App\Mail\RefundApprovedMail::class,
            'payout.completed' => \App\Mail\PayoutCompletedMail::class,
            'support.response' => \App\Mail\SupportResponseMail::class,
            'promotion.offer' => \App\Mail\PromotionOfferMail::class,
            default => null,
        };
    }
}
