<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class DeleteAccountJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $userId) {}

    public function handle(): void
    {
        DB::transaction(function () {
            $user = User::find($this->userId);
            if (!$user) return;

            // Anonymize User Record instead of hard deleting to preserve financial integrity
            $user->update([
                'name' => 'Deleted User',
                'email' => 'deleted_' . $this->userId . '@velora.local',
                'password' => '',
                'phone' => null,
                'is_active' => false,
            ]);

            // Soft delete/anonymize profile, addresses, etc.
        });
    }
}
