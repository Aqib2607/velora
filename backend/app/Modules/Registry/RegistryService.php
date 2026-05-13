<?php

namespace App\Modules\Registry;

use App\Models\Registry;
use App\Models\RegistryItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class RegistryService
{
    /**
     * Create a new registry.
     */
    public function create(int $userId, int $tenantId, array $data): Registry
    {
        return Registry::create([
            'tenant_id'        => $tenantId,
            'user_id'          => $userId,
            'title'            => $data['title'],
            'slug'             => Str::slug($data['title']) . '-' . Str::random(6),
            'event_type'       => $data['event_type'] ?? 'other',
            'event_date'       => $data['event_date'],
            'visibility'       => $data['visibility'] ?? 'private',
            'shipping_address' => $data['shipping_address'] ?? null,
        ]);
    }

    /**
     * Add item to registry.
     */
    public function addItem(Registry $registry, int $productId, int $quantity = 1, ?string $notes = null): RegistryItem
    {
        return $registry->items()->create([
            'tenant_id'          => $registry->tenant_id,
            'product_id'         => $productId,
            'quantity_desired'   => $quantity,
            'quantity_purchased' => 0,
            'priority'           => 'medium',
            'notes'              => $notes,
        ]);
    }

    /**
     * Reserve an item from registry (part of gift purchase flow).
     * Idempotent/Duplicate reservation prevention by using optimistic/pessimistic locking.
     */
    public function purchaseItem(int $registryItemId, int $quantityToPurchase, int $tenantId): RegistryItem
    {
        return DB::transaction(function () use ($registryItemId, $quantityToPurchase, $tenantId) {
            $item = RegistryItem::where('id', $registryItemId)
                ->where('tenant_id', $tenantId)
                ->lockForUpdate()
                ->firstOrFail();

            $remaining = $item->quantity_desired - $item->quantity_purchased;
            if ($quantityToPurchase > $remaining) {
                throw new RuntimeException("Cannot purchase {$quantityToPurchase} items. Only {$remaining} remaining.");
            }

            $item->quantity_purchased += $quantityToPurchase;
            $item->save();

            return $item;
        });
    }
}
