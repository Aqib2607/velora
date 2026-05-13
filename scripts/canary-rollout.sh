#!/usr/bin/env bash
# Phase H.1: Production Promotion & Release Governance
# Manages blue-green switches, canary rollouts, and automatic rollbacks

set -e

NAMESPACE="velora-prod"
DEPLOYMENT=$1
NEW_VERSION=$2

if [ -z "$DEPLOYMENT" ] || [ -z "$NEW_VERSION" ]; then
  echo "Usage: $0 <deployment-name> <new-version-tag>"
  exit 1
fi

echo "================================================="
echo "Executing Canary Rollout for $DEPLOYMENT:$NEW_VERSION"
echo "================================================="

# Step 1: Deploy Canary (5% traffic)
echo "[1/4] Deploying Canary (5% traffic)..."
kubectl set image deployment/${DEPLOYMENT}-canary ${DEPLOYMENT}=registry.velora.io/velora/${DEPLOYMENT}:$NEW_VERSION -n $NAMESPACE

# Update Istio VirtualService or Ingress for traffic splitting
cat <<EOF | kubectl apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ${DEPLOYMENT}-route
  namespace: $NAMESPACE
spec:
  hosts:
  - ${DEPLOYMENT}.velora.io
  http:
  - route:
    - destination:
        host: ${DEPLOYMENT}-primary
      weight: 95
    - destination:
        host: ${DEPLOYMENT}-canary
      weight: 5
EOF

echo "Waiting for canary pods to be ready..."
kubectl rollout status deployment/${DEPLOYMENT}-canary -n $NAMESPACE

# Step 2: Validate Canary Health
echo "[2/4] Validating Canary Health..."
sleep 60 # Allow metrics to gather
ERROR_RATE=$(curl -s "http://prometheus:9090/api/v1/query?query=sum(rate(http_requests_total{status=~\"5..\",pod=~\"${DEPLOYMENT}-canary.*\"}[1m]))/sum(rate(http_requests_total{pod=~\"${DEPLOYMENT}-canary.*\"}[1m]))")
ERROR_VALUE=$(echo $ERROR_RATE | jq -r '.data.result[0].value[1] // 0')

if (( $(echo "$ERROR_VALUE > 0.05" | bc -l) )); then
  echo "CRITICAL: Error rate $ERROR_VALUE exceeds 5% threshold. Initiating rollback."
  bash ./scripts/rollback-deployment.sh $DEPLOYMENT
  exit 1
fi

# Step 3: Shift to 50% traffic
echo "[3/4] Shifting 50% traffic to new release..."
cat <<EOF | kubectl apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ${DEPLOYMENT}-route
  namespace: $NAMESPACE
spec:
  hosts:
  - ${DEPLOYMENT}.velora.io
  http:
  - route:
    - destination:
        host: ${DEPLOYMENT}-primary
      weight: 50
    - destination:
        host: ${DEPLOYMENT}-canary
      weight: 50
EOF

sleep 120 # Observation period

# Step 4: Full Promotion (100% traffic)
echo "[4/4] Promoting to 100% traffic..."
kubectl set image deployment/${DEPLOYMENT}-primary ${DEPLOYMENT}=registry.velora.io/velora/${DEPLOYMENT}:$NEW_VERSION -n $NAMESPACE
kubectl rollout status deployment/${DEPLOYMENT}-primary -n $NAMESPACE

# Restore routing to primary only
cat <<EOF | kubectl apply -f -
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: ${DEPLOYMENT}-route
  namespace: $NAMESPACE
spec:
  hosts:
  - ${DEPLOYMENT}.velora.io
  http:
  - route:
    - destination:
        host: ${DEPLOYMENT}-primary
      weight: 100
    - destination:
        host: ${DEPLOYMENT}-canary
      weight: 0
EOF

echo "Deployment of $NEW_VERSION complete and verified."
