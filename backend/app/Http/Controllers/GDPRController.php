<?php

namespace App\Http\Controllers;

use App\Jobs\ExportUserDataJob;
use App\Jobs\DeleteAccountJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GDPRController extends Controller
{
    public function export(Request $request): JsonResponse
    {
        // Dispatch job to compile user data (orders, tickets, profile) into a zip and email
        ExportUserDataJob::dispatch($request->user()->id);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Data export initiated. You will receive an email shortly.'
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        // Require explicit confirmation/password
        $request->validate(['confirmation' => 'required|in:DELETE']);

        // Dispatch job to scrub PII and anonymize data, retaining financial ledgers
        DeleteAccountJob::dispatch($request->user()->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Account deletion process started. Your data will be anonymized per GDPR.'
        ]);
    }
}
