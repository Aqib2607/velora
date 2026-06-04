<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PayoutCompletedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        private readonly string $title,
        private readonly string $body,
        private readonly array $data,
    ) {}

    public function build()
    {
        return $this
            ->subject($this->title)
            ->view('emails.payout-completed', [
                'title' => $this->title,
                'body' => $this->body,
                'data' => $this->data,
            ]);
    }
}
