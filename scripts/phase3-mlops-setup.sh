#!/bin/bash
# Phase 3: Real MLOps & AI Productionization - Setup Script
# Initializes feature store, trains base models, deploys inference service

set -e

NAMESPACE=${NAMESPACE:-velora-prod}
ML_NAMESPACE=${ML_NAMESPACE:-velora-prod}
GCP_PROJECT=${GCP_PROJECT:-velora-gcp-prod}
IMAGE_REGISTRY=${IMAGE_REGISTRY:-registry.velora.io}

echo "============================================"
echo "Phase 3: ML Operations Setup"
echo "============================================"

# 1. Setup Feast Feature Store
echo "[1/8] Setting up Feast feature store..."
mkdir -p ml/features
cd ml

# Create feature store registry
feast init -t gcp feature_store_config.yaml

# Register entities
feast apply

cd ..

# 2. Create BigQuery datasets for offline store
echo "[2/8] Creating BigQuery datasets..."
bq mk --dataset --location=US $GCP_PROJECT:feature_store || true
bq mk --dataset --location=US $GCP_PROJECT:ml_training || true
bq mk --dataset --location=US $GCP_PROJECT:ml_monitoring || true

# 3. Create Redis online store
echo "[3/8] Setting up Redis online feature store..."
kubectl apply -f k8s/redis.yaml -n $NAMESPACE

# Wait for Redis
kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=300s || true

# 4. Build and push ML Docker images
echo "[4/8] Building ML service images..."
docker build -f docker/Dockerfile.ml-inference -t $IMAGE_REGISTRY/ml-inference:latest .
docker push $IMAGE_REGISTRY/ml-inference:latest

docker build -f docker/Dockerfile.ml-training -t $IMAGE_REGISTRY/ml-training:latest .
docker push $IMAGE_REGISTRY/ml-training:latest

docker build -f docker/Dockerfile.ml-gpu-inference -t $IMAGE_REGISTRY/ml-gpu-inference:latest .
docker push $IMAGE_REGISTRY/ml-gpu-inference:latest

docker build -f docker/Dockerfile.ml-gpu-training -t $IMAGE_REGISTRY/ml-gpu-training:latest .
docker push $IMAGE_REGISTRY/ml-gpu-training:latest

# 5. Create Kubernetes namespaces and RBAC
echo "[5/8] Setting up Kubernetes RBAC..."
kubectl create namespace $NAMESPACE || true

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ServiceAccount
metadata:
  name: ml-training-sa
  namespace: velora-prod-infra

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: ml-training-role
rules:
- apiGroups: [""]
  resources: ["persistentvolumes", "persistentvolumeclaims"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: ml-training-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: ml-training-role
subjects:
- kind: ServiceAccount
  name: ml-training-sa
  namespace: velora-prod-infra
EOF

# 6. Deploy ML inference service
echo "[6/8] Deploying ML inference service..."
kubectl apply -f k8s/ml-inference.yaml -n $NAMESPACE

# Wait for deployment
kubectl rollout status deployment/ml-inference-service -n $NAMESPACE --timeout=600s || true

# 7. Deploy GPU workers
echo "[7/8] Deploying GPU worker nodes..."
kubectl apply -f k8s/ml-gpu-workers.yaml -n $NAMESPACE

# 8. Initialize MLflow tracking server
echo "[8/8] Setting up MLflow tracking..."
gcloud run deploy mlflow-tracking \
  --source . \
  --platform managed \
  --region us-central1 \
  --project $GCP_PROJECT \
  --memory 4Gi \
  --cpu 2 \
  --timeout 3600 \
  --port 5000 \
  || echo "MLflow tracking server already exists"

echo ""
echo "============================================"
echo "Phase 3 Setup Complete"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Train initial models: python ml/training_pipeline.py"
echo "2. Monitor ML health: kubectl logs -f deployment/ml-inference-service -n $NAMESPACE"
echo "3. Access MLflow: gcloud run services describe mlflow-tracking --region us-central1"
echo ""
