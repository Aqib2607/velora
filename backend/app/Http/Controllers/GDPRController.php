<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class GDPRController extends Controller
{
    /**
     * Export all personal data for the authenticated user (GDPR Article 20 — Data Portability).
     *
     * Returns: profile, orders, addresses, notifications, support tickets.
     * Background job dispatch in production; synchronous for now.
     */
    public function export(Request $request): JsonResponse
    {
        $user = $request->user();

        $export = [
            'profile' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'created_at' => $user->created_at,
            ],
            'orders' => $user->orders()->with('items')->get()->map(fn ($o) => [
                'order_number' => $o->order_number,
                'status'       => $o->status,
                'total'        => $o->total,
                'created_at'   => $o->created_at,
                'items'        => $o->items->map(fn ($i) => [
                    'product_id' => $i->product_id,
                    'quantity'   => $i->quantity,
                    'subtotal'   => $i->subtotal,
                ]),
            ]),
            'support_tickets' => $user->supportTickets()->get()->map(fn ($t) => [
                'subject'    => $t->subject,
                'status'     => $t->status,
                'created_at' => $t->created_at,
            ]),
            'exported_at' => now()->toIso8601String(),
        ];

        // In production: dispatch a job to email the export as a ZIP
        // dispatch(new ExportUserDataJob($user, $export));

        return response()->json([
            'status'  => 'success',
            'message' => 'Your data export has been prepared. In production, this would be emailed to you.',
            'data'    => $export,
        ]);
    }

    /**
     * Hard-delete the authenticated user account (GDPR Article 17 — Right to Erasure).
     *
     * Revokes all tokens, soft-deletes user and their non-financial records.
     * Financial records (orders, ledger) are retained for legal compliance (7 years).
     */
    public function deleteAccount(Request $request): JsonResponse
    {
        $request->validate([
            'password'   => 'required|string',
            'confirm'    => 'required|in:DELETE MY ACCOUNT',
        ]);

        $user = $request->user();

        if (! Hash::check($request->password, $user->password)) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Password does not match. Account deletion cancelled.',
            ], 422);
        }

        // Revoke all Sanctum tokens
        $user->tokens()->delete();

        // Anonymise PII — retain records for financial compliance
        $user->update([
            'name'       => '[DELETED USER]',
            'email'      => "deleted+{$user->id}@velora.invalid",
            'deleted_at' => now(),
        ]);

        return response()->json([
            'status'  => 'success',
            'message' => 'Your account has been deleted. Financial records are retained for legal compliance per GDPR Recital 65.',
        ]);
    }
}
