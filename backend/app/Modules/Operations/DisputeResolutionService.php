<?php

namespace App\Modules\Operations;

use App\Models\Order;
use App\Models\SupportTicket;
use Illuminate\Support\Facades\DB;

class DisputeResolutionService
{
    /**
     * Escalate an order issue to a formal dispute requiring marketplace arbitration.
     */
    public function escalateToDispute(Order $order, string $reason, string $evidenceUrl): SupportTicket
    {
        return DB::transaction(function () use ($order, $reason, $evidenceUrl) {
            // Freeze order payout
            $order->update(['status' => 'disputed']);

            // Open high-priority arbitration ticket
            $ticket = SupportTicket::create([
                'tenant_id' => $order->tenant_id,
                'user_id' => $order->user_id,
                'subject' => "Arbitration Required: Order {$order->id}",
                'status' => 'escalated',
                'priority' => 'high'
            ]);

            $ticket->messages()->create([
                'user_id' => $order->user_id,
                'message' => "Dispute Reason: {$reason}. Evidence: {$evidenceUrl}",
                'is_internal' => false
            ]);

            // Alert arbitration team
            event(new \App\Events\DisputeEscalated($order, $ticket));

            return $ticket;
        });
    }

    /**
     * Resolve a dispute with a final ruling.
     */
    public function resolveDispute(SupportTicket $ticket, string $ruling, string $notes): void
    {
        DB::transaction(function () use ($ticket, $ruling, $notes) {
            $ticket->update(['status' => 'resolved']);
            
            $ticket->messages()->create([
                'user_id' => auth()->id(), // Admin arbitrator
                'message' => "Arbitration Ruling: {$ruling}. Notes: {$notes}",
                'is_internal' => true
            ]);

            // E.g., if ruling is 'refund_buyer', trigger RefundService
        });
    }
}
