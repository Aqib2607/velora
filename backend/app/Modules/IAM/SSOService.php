<?php

namespace App\Modules\IAM;

use Laravel\Socialite\Facades\Socialite;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class SSOService
{
    /**
     * Handle SAML/OIDC federated login
     */
    public function handleFederatedLogin(string $provider): string
    {
        return Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();
    }

    /**
     * Process federated callback and enforce enterprise policies
     */
    public function processCallback(string $provider): array
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();
        
        // Map email domain to Enterprise Tenant
        $domain = substr(strrchr($socialUser->getEmail(), "@"), 1);
        $tenant = \App\Models\Tenant::where('sso_domain', $domain)->firstOrFail();

        $user = User::firstOrCreate(
            ['email' => $socialUser->getEmail()],
            [
                'name' => $socialUser->getName(),
                'tenant_id' => $tenant->id,
                'sso_id' => $socialUser->getId(),
                'sso_provider' => $provider,
                'password' => bcrypt(\Illuminate\Support\Str::random(24))
            ]
        );

        // Check if enterprise disabled the account
        if (!$user->is_active) {
            throw new \Exception('Account administratively disabled.');
        }

        Auth::login($user);

        return [
            'token' => $user->createToken('sso-login')->plainTextToken,
            'user' => $user
        ];
    }
}
