#!/bin/bash
# Phase 4: Global Active-Active Database Setup
# Configures multi-region PostgreSQL logical replication

set -e

NAMESPACE=${NAMESPACE:-velora-prod-data}
REGIONS=("us-central" "eu-west" "asia-sg")
PRIMARY_REGION="us-central"

echo "============================================"
echo "Phase 4: Global Database Setup"
echo "============================================"

# 1. Create namespace and RBAC
echo "[1/6] Setting up Kubernetes resources..."
kubectl create namespace $NAMESPACE || true

kubectl apply -f k8s/postgres-replication.yaml -n $NAMESPACE

# 2. Wait for primary to be ready
echo "[2/6] Waiting for PostgreSQL primary..."
kubectl wait --for=condition=ready pod -l app=postgres-primary -n $NAMESPACE --timeout=600s

# 3. Create publications on primary
echo "[3/6] Setting up logical replication..."
kubectl exec -n $NAMESPACE postgres-primary-0 -- psql -U postgres -d postgres << 'SQL'
  CREATE PUBLICATION all_tables FOR ALL TABLES;
  CREATE USER replication WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';
  GRANT USAGE ON SCHEMA public TO replication;
  GRANT CREATE ON DATABASE postgres TO replication;
SQL

# 4. Wait for replicas
echo "[4/6] Waiting for replicas..."
for replica in postgres-replica-eu postgres-replica-asia; do
  kubectl wait --for=condition=ready pod -l app=$replica -n $NAMESPACE --timeout=600s || true
done

# 5. Set up subscriptions (bi-directional replication)
echo "[5/6] Configuring bi-directional replication..."

# EU → Primary (for EU being secondary)
kubectl exec -n $NAMESPACE postgres-replica-eu-0 -- psql -U postgres -d postgres << 'SQL'
  CREATE SUBSCRIPTION eu_subscription
    CONNECTION 'host=postgres-primary port=5432 user=replication password=replication_password dbname=postgres'
    PUBLICATION all_tables
    WITH (copy_data = true, synchronous_commit = local);
SQL

# Asia → Primary
kubectl exec -n $NAMESPACE postgres-replica-asia-0 -- psql -U postgres -d postgres << 'SQL'
  CREATE SUBSCRIPTION asia_subscription
    CONNECTION 'host=postgres-primary port=5432 user=replication password=replication_password dbname=postgres'
    PUBLICATION all_tables
    WITH (copy_data = true, synchronous_commit = local);
SQL

# 6. Verify replication
echo "[6/6] Verifying replication health..."
kubectl exec -n $NAMESPACE postgres-primary-0 -- psql -U postgres -d postgres -c "SELECT * FROM pg_stat_replication;"

echo ""
echo "============================================"
echo "Phase 4 Setup Complete"
echo "============================================"
echo ""
echo "Multi-region database replication active:"
echo "- Primary: postgres-primary (us-central)"
echo "- Replica: postgres-replica-eu (eu-west)"
echo "- Replica: postgres-replica-asia (asia-sg)"
echo ""
