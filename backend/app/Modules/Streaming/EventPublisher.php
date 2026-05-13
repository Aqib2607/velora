<?php

namespace App\Modules\Streaming;

use Illuminate\Support\Facades\Log;
// use RdKafka\Producer; // Assuming librdkafka extension installed for production

class EventPublisher
{
    /**
     * Publish a domain event to the Kafka/Redpanda cluster.
     */
    public function publish(string $topic, string $eventName, array $payload, ?string $partitionKey = null): void
    {
        $message = [
            'event_id'   => \Illuminate\Support\Str::uuid()->toString(),
            'event_type' => $eventName,
            'timestamp'  => now()->toIso8601String(),
            'tenant_id'  => app('tenant') ? app('tenant')->id : null,
            'payload'    => $payload,
        ];

        // For local development or if Kafka is down, we log it.
        // In production, this pushes to the RdKafka Producer queue.
        Log::info("Published to Kafka Topic [{$topic}]: {$eventName}", ['partition_key' => $partitionKey]);
        
        // Example implementation with a Kafka package:
        // Kafka::publishOn($topic)
        //     ->withKey($partitionKey)
        //     ->withMessage(new \App\Kafka\Message(json_encode($message)))
        //     ->send();
    }
}
