<?php

namespace App\Modules\Support;

use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupportTicketService
{
    public function create(int $userId, int $tenantId, array $data): SupportTicket
    {
        return DB::transaction(function () use ($userId, $tenantId, $data) {
            $ticket = SupportTicket::create([
                'tenant_id'     => $tenantId,
                'user_id'       => $userId,
                'ticket_number' => 'TKT-' . strtoupper(Str::random(10)),
                'subject'       => $data['subject'],
                'category'      => $data['category'] ?? 'general',
                'status'        => 'open',
                'priority'      => $data['priority'] ?? 'normal',
                'region_code'   => $data['region_code'] ?? null,
            ]);

            $this->addMessage($ticket, $userId, $data['message'], false, $data['attachments'] ?? []);

            return $ticket;
        });
    }

    public function addMessage(SupportTicket $ticket, int $userId, string $message, bool $isInternal = false, array $attachments = []): SupportTicketMessage
    {
        $msg = $ticket->messages()->create([
            'user_id'     => $userId,
            'message'     => $message,
            'is_internal' => $isInternal,
            'attachments' => empty($attachments) ? null : $attachments,
        ]);

        if (!$isInternal) {
            // If user replies, and ticket is waiting_customer, move to open/in_progress
            if ($ticket->user_id === $userId && $ticket->status === 'waiting_customer') {
                $ticket->update(['status' => 'open']);
            }
            // If admin replies, and ticket is open, move to waiting_customer or in_progress
            elseif ($ticket->user_id !== $userId && in_array($ticket->status, ['open'])) {
                $ticket->update(['status' => 'waiting_customer']);
            }
        }

        return $msg;
    }

    public function updateStatus(SupportTicket $ticket, string $status): void
    {
        $ticket->update(['status' => $status]);
    }
}
