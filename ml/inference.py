"""
Velora ML Inference Service - FastAPI-based model serving for fraud detection,
chargeback prediction, and risk scoring. Integrates Feast feature store with
PyTorch/sklearn models via MLflow.
"""

import os
import json
from datetime import datetime
from typing import Dict, Optional
from enum import Enum

import numpy as np
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
import redis
from feast import FeatureStore
import mlflow.pytorch
import mlflow.sklearn
import joblib

# Initialize
app = FastAPI(title="Velora ML Inference", version="1.0.0")
fs = FeatureStore(repo_path="ml/feature_store_config.yaml")

# Load models
mlflow.set_registry_uri(os.getenv("MLFLOW_REGISTRY_URI", "gs://velora-ml-registry"))
fraud_model = mlflow.sklearn.load_model("models:/fraud_detection_v1/production")
chargeback_model = mlflow.sklearn.load_model("models:/chargeback_prediction_v1/production")
risk_model = mlflow.sklearn.load_model("models:/merchant_risk_scoring_v1/production")

# Redis cache
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis-service"),
    port=6379,
    decode_responses=True
)

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class FraudDetectionRequest(BaseModel):
    transaction_id: str
    merchant_id: str
    customer_id: str
    amount: float
    currency: str
    payment_method: str
    device_fingerprint: str
    ip_address: str
    billing_country: str
    shipping_country: str

class ChargebackPredictionRequest(BaseModel):
    transaction_id: str
    merchant_id: str
    customer_id: str
    amount: float
    product_category: str

class MerchantRiskRequest(BaseModel):
    merchant_id: str

class InferenceResponse(BaseModel):
    request_id: str
    model: str
    risk_level: RiskLevel
    risk_score: float
    confidence: float
    recommendation: str
    inference_time_ms: float
    timestamp: str

@app.post("/api/v1/fraud-detection")
async def detect_fraud(request: FraudDetectionRequest, background_tasks: BackgroundTasks):
    """Real-time fraud detection for transactions (0-1 scale)"""
    
    request_id = f"fraud_{request.transaction_id}_{datetime.utcnow().timestamp()}"
    start_time = datetime.utcnow()
    
    try:
        # Check cache
        cache_key = f"fraud_pred:{request.transaction_id}"
        cached = redis_client.get(cache_key)
        if cached:
            return json.loads(cached)
        
        # Get features
        entity_rows = [{"merchant_id": request.merchant_id, "customer_id": request.customer_id}]
        feature_df = fs.get_online_features(
            features=[
                "merchant_features:merchant_fraud_score",
                "merchant_features:merchant_chargeback_rate",
                "customer_features:customer_chargeback_history",
                "customer_features:customer_purchase_frequency_7d",
                "transaction_features:transaction_velocity_1h"
            ],
            entity_rows=entity_rows
        ).to_dict()
        
        # Build feature vector
        features = [
            feature_df.get(f, [0])[0] for f in [
                "merchant_fraud_score", "merchant_chargeback_rate",
                "customer_chargeback_history", "customer_purchase_frequency_7d",
                "transaction_velocity_1h", request.amount,
                1.0 if request.billing_country != request.shipping_country else 0.0
            ]
        ]
        
        fraud_score = float(fraud_model.predict([features])[0])
        fraud_conf = float(fraud_model.predict_proba([features])[0].max())
        
        if fraud_score > 0.9:
            risk_level = RiskLevel.CRITICAL
            rec = "BLOCK_TRANSACTION"
        elif fraud_score > 0.7:
            risk_level = RiskLevel.HIGH
            rec = "REQUIRE_3D_SECURE"
        elif fraud_score > 0.4:
            risk_level = RiskLevel.MEDIUM
            rec = "MONITOR"
        else:
            risk_level = RiskLevel.LOW
            rec = "APPROVE"
        
        response = InferenceResponse(
            request_id=request_id,
            model="fraud_detection_v1",
            risk_level=risk_level,
            risk_score=fraud_score,
            confidence=fraud_conf,
            recommendation=rec,
            inference_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
            timestamp=datetime.utcnow().isoformat()
        )
        
        redis_client.setex(cache_key, 300, json.dumps(response.dict()))
        background_tasks.add_task(log_inference, request_id, "fraud_detection", response.dict())
        
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/chargeback-prediction")
async def predict_chargeback(request: ChargebackPredictionRequest, background_tasks: BackgroundTasks):
    """Predict chargeback probability"""
    
    request_id = f"cb_{request.transaction_id}"
    start_time = datetime.utcnow()
    
    try:
        entity_rows = [{"merchant_id": request.merchant_id, "customer_id": request.customer_id}]
        feature_df = fs.get_online_features(
            features=[
                "merchant_features:merchant_chargeback_rate",
                "customer_features:customer_chargeback_history"
            ],
            entity_rows=entity_rows
        ).to_dict()
        
        features = [feature_df.get(f, [0])[0] for f in ["merchant_chargeback_rate", "customer_chargeback_history", request.amount]]
        
        cb_score = float(chargeback_model.predict([features])[0])
        cb_conf = float(chargeback_model.predict_proba([features])[0].max())
        
        risk_level = RiskLevel.HIGH if cb_score > 0.6 else RiskLevel.MEDIUM if cb_score > 0.3 else RiskLevel.LOW
        rec = "VERIFY_CUSTOMER" if cb_score > 0.6 else "MONITOR" if cb_score > 0.3 else "APPROVE"
        
        response = InferenceResponse(
            request_id=request_id,
            model="chargeback_prediction_v1",
            risk_level=risk_level,
            risk_score=cb_score,
            confidence=cb_conf,
            recommendation=rec,
            inference_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
            timestamp=datetime.utcnow().isoformat()
        )
        
        background_tasks.add_task(log_inference, request_id, "chargeback_prediction", response.dict())
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/merchant-risk-score")
async def score_merchant(request: MerchantRiskRequest, background_tasks: BackgroundTasks):
    """Score merchant risk level"""
    
    request_id = f"risk_{request.merchant_id}"
    start_time = datetime.utcnow()
    
    try:
        entity_rows = [{"merchant_id": request.merchant_id}]
        feature_df = fs.get_online_features(
            features=[
                "merchant_features:merchant_chargeback_rate",
                "merchant_features:merchant_dispute_rate",
                "merchant_features:merchant_account_age_days",
                "merchant_features:merchant_monthly_volume"
            ],
            entity_rows=entity_rows
        ).to_dict()
        
        features = [feature_df.get(f, [0])[0] for f in ["merchant_chargeback_rate", "merchant_dispute_rate", "merchant_account_age_days", "merchant_monthly_volume"]]
        
        risk_score = float(risk_model.predict([features])[0])
        risk_conf = float(risk_model.predict_proba([features])[0].max())
        
        if risk_score > 0.8:
            risk_level = RiskLevel.CRITICAL
            rec = "SUSPEND_ACCOUNT"
        elif risk_score > 0.6:
            risk_level = RiskLevel.HIGH
            rec = "ENHANCED_MONITORING"
        elif risk_score > 0.3:
            risk_level = RiskLevel.MEDIUM
            rec = "MONITOR"
        else:
            risk_level = RiskLevel.LOW
            rec = "STANDARD_MONITORING"
        
        response = InferenceResponse(
            request_id=request_id,
            model="merchant_risk_scoring_v1",
            risk_level=risk_level,
            risk_score=risk_score,
            confidence=risk_conf,
            recommendation=rec,
            inference_time_ms=(datetime.utcnow() - start_time).total_seconds() * 1000,
            timestamp=datetime.utcnow().isoformat()
        )
        
        background_tasks.add_task(log_inference, request_id, "merchant_risk_scoring", response.dict())
        return response.dict()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "feature_store": "connected",
            "redis": redis_client.ping(),
            "models": "loaded"
        }
    }

async def log_inference(request_id: str, model: str, result: Dict):
    """Log inference for monitoring"""
    try:
        log_entry = {"request_id": request_id, "model": model, "result": result, "timestamp": datetime.utcnow().isoformat()}
        redis_client.lpush(f"inference_logs:{model}", json.dumps(log_entry))
        redis_client.ltrim(f"inference_logs:{model}", 0, 9999)
    except Exception as e:
        print(f"Log error: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080, workers=4)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
