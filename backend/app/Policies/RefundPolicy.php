<?php

namespace App\Policies;

use App\Models\Refund;
use App\Models\User;

class RefundPolicy
{
    /**
     * A user can view their own refunds, or any refund if admin.
     */
    public function view(User $user, Refund $refund): bool
    {
        return $user->id === $refund->requested_by || $user->hasRole('admin');
    }

    /**
     * Only admins can approve refunds.
     */
    public function approve(User $user, Refund $refund): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Only admins can reject refunds.
     */
    public function reject(User $user, Refund $refund): bool
    {
        return $user->hasRole('admin');
    }
}
