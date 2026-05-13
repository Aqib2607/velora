<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SupportTicketController extends Controller
{
    public function __construct(private readonly \App\Modules\Support\SupportTicketService $service) {}

    public function index(Request $request): JsonResponse
    {
        $tickets = SupportTicket::where('user_id', $request->user()->id)->orderByDesc('created_at')->get();
        return response()->json(['status' => 'success', 'data' => $tickets]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject'  => 'required|string',
            'message'  => 'required|string',
            'category' => 'nullable|string',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'region_code' => 'nullable|string',
            'attachments' => 'nullable|array'
        ]);

        $ticket = $this->service->create($request->user()->id, app('tenant')->id, $validated);

        return response()->json(['status' => 'success', 'data' => $ticket]);
    }

    public function show(SupportTicket $ticket): JsonResponse
    {
        // Add basic check
        if ($ticket->user_id !== \Illuminate\Support\Facades\Auth::id() && !\Illuminate\Support\Facades\Auth::user()->hasRole('admin')) {
            abort(403);
        }
        
        return response()->json(['status' => 'success', 'data' => $ticket->load(['messages' => function($q) {
            // Non-admins shouldn't see internal notes
            if (!\Illuminate\Support\Facades\Auth::user()->hasRole('admin')) {
                $q->where('is_internal', false);
            }
            $q->with('user:id,name')->oldest();
        }])]);
    }

    public function addMessage(SupportTicket $ticket, Request $request): JsonResponse
    {
        if ($ticket->user_id !== $request->user()->id && !$request->user()->hasRole('admin')) {
            abort(403);
        }

        $validated = $request->validate([
            'message'     => 'required|string',
            'is_internal' => 'nullable|boolean',
            'attachments' => 'nullable|array'
        ]);

        $isInternal = ($validated['is_internal'] ?? false) && $request->user()->hasRole('admin');

        $msg = $this->service->addMessage($ticket, $request->user()->id, $validated['message'], $isInternal, $validated['attachments'] ?? []);

        return response()->json(['status' => 'success', 'data' => $msg]);
    }
}
