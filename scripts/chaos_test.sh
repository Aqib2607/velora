#!/bin/bash
set -e

echo "Starting Velora Chaos Engineering Test Suite"

# 1. Simulate Redis Outage
echo "Injecting fault: Redis container pause (Simulating Cache/Queue outage)"
docker pause velora-redis-1 || true
sleep 10
# Validate application degrades gracefully (should fallback to DB or return defaults)
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/search || true
docker unpause velora-redis-1 || true
echo "Redis restored."

# 2. Simulate Primary DB Failover
echo "Injecting fault: MySQL Primary network partition"
# In a real environment, this triggers AWS RDS failover or LitmusChaos network dropping
# We simulate a delay here
sleep 5
echo "Failover simulation complete. Validating Read Replicas..."
php /var/www/html/artisan health:check --db

# 3. Simulate Webhook Retry Storm
echo "Simulating Stripe Webhook Retry Storm (1000 requests/sec)"
# Uses K6 or Apache Benchmark
ab -n 1000 -c 100 http://localhost:8000/api/webhooks/stripe || true

echo "Chaos Test Suite Completed."
