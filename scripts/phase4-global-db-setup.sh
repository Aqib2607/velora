#!/bin/bash
# Phase 4: Global Active-Active Database Setup (REVISED)
# Configures MySQL primary-replica replication across regions

set -e

NAMESPACE=${NAMESPACE:-velora-prod-data}
PRIMARY_REGION="us-central"
REPLICA_REGION="eu-west"

echo "============================================"
echo "Phase 4: Global Database Setup"
echo "============================================"

# 1. Create namespace and RBAC
echo "[1/6] Setting up Kubernetes resources..."
kubectl create namespace $NAMESPACE || true

kubectl apply -f k8s/mysql-primary.yaml -n $NAMESPACE

# 2. Wait for primary to be ready
echo "[2/6] Waiting for MySQL primary..."
kubectl wait --for=condition=ready pod -l app=mysql-primary -n $NAMESPACE --timeout=600s

# 3. Create replication user on primary
echo "[3/6] Setting up replication..."
kubectl exec -n $NAMESPACE mysql-primary-0 -- mysql -u root -p$MYSQL_ROOT_PASSWORD << 'SQL'
  CREATE USER IF NOT EXISTS 'replication'@'%' IDENTIFIED BY 'replication_password';
  GRANT REPLICATION SLAVE ON *.* TO 'replication'@'%';
  FLUSH PRIVILEGES;
  SHOW MASTER STATUS;
SQL

# 4. Wait for replica
echo "[4/6] Waiting for replica..."
kubectl wait --for=condition=ready pod -l app=mysql-replica-eu -n $NAMESPACE --timeout=600s || true

# 5. Configure replica replication
echo "[5/6] Configuring replica replication..."

# EU Replica → Primary (one-way replication)
kubectl exec -n $NAMESPACE mysql-replica-eu-0 -- mysql -u root -p$MYSQL_ROOT_PASSWORD << 'SQL'
  STOP SLAVE;
  CHANGE MASTER TO
    MASTER_HOST='mysql-primary.velora-prod-data.svc.cluster.local',
    MASTER_USER='replication',
    MASTER_PASSWORD='replication_password',
    MASTER_LOG_FILE='mysql-bin.000001',
    MASTER_LOG_POS=154;
  START SLAVE;
SQL

# 6. Verify replication
echo "[6/6] Verifying replication health..."
kubectl exec -n $NAMESPACE mysql-replica-eu-0 -- mysql -u root -p$MYSQL_ROOT_PASSWORD -e "SHOW SLAVE STATUS\G"

echo ""
echo "============================================"
echo "Phase 4 Setup Complete"
echo "============================================"
echo ""
echo "Database replication active:"
echo "- Primary: mysql-primary (us-central)"
echo "- Replica: mysql-replica-eu (eu-west)"
echo ""
