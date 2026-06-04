<?php

namespace App\Listeners;

use App\Services\MetricsService;
use Illuminate\Database\Events\QueryExecuted;

class RecordDatabaseQuery
{
    /**
     * Handle the event.
     */
    public function handle(QueryExecuted $event): void
    {
        try {
            $connection = $event->connectionName ?? 'default';
            $duration = $event->time / 1000; // Convert milliseconds to seconds
            
            MetricsService::recordDatabaseQuery($connection, $duration, false);
        } catch (\Exception $e) {
            \Log::warning('Failed to record database query metrics: ' . $e->getMessage());
        }
    }
}
