<?php

namespace App\Modules\Operations;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class KYCVerificationService
{
    /**
     * Submit merchant details to external KYC/KYB provider (e.g., Stripe Identity, Jumio).
     */
    public function submitKYC(User $merchant, array $documentData): array
    {
        // Mocking the API call to a real KYC provider
        $response = Http::withToken(env('KYC_PROVIDER_KEY'))
            ->post('https://api.kycprovider.example.com/v1/verify', [
                'entity_type' => 'business',
                'business_details' => $documentData['business'],
                'beneficial_owner' => $documentData['owner']
            ]);

        if ($response->successful()) {
            $merchant->update(['kyc_status' => 'pending_verification']);
            return ['status' => 'submitted', 'reference_id' => $response->json('id')];
        }

        throw new \Exception('Failed to submit KYC documents.');
    }

    /**
     * Webhook handler for async KYC status updates.
     */
    public function handleProviderWebhook(string $referenceId, string $status): void
    {
        $merchant = User::where('kyc_reference_id', $referenceId)->firstOrFail();
        
        $merchant->update(['kyc_status' => $status]);

        if ($status === 'verified') {
            event(new \App\Events\MerchantVerified($merchant));
        }
    }
}
