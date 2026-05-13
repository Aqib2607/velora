"""
Velora ML Model Monitoring - Drift detection, performance tracking, and alerting
"""

import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
import json

import redis
from prometheus_client import Counter, Histogram, Gauge
import mlflow

# Prometheus metrics
inference_requests = Counter(
    'ml_inference_requests_total',
    'Total inference requests',
    ['model', 'status']
)

inference_latency = Histogram(
    'ml_inference_latency_seconds',
    'Inference latency in seconds',
    ['model'],
    buckets=(0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0)
)

model_auc_gauge = Gauge(
    'ml_model_auc',
    'Model AUC score',
    ['model']
)

model_drift_gauge = Gauge(
    'ml_model_drift_magnitude',
    'Model drift magnitude',
    ['model']
)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis-service"),
    port=6379,
    decode_responses=True
)

class ModelMonitoring:
    
    def __init__(self):
        self.mlflow_client = mlflow.tracking.MlflowClient()
    
    def track_inference(self, model_name: str, request_id: str, 
                       input_features: Dict, prediction: float, 
                       latency_ms: float, status: str = "success"):
        """Track inference for monitoring"""
        
        # Update Prometheus metrics
        inference_requests.labels(model=model_name, status=status).inc()
        inference_latency.labels(model=model_name).observe(latency_ms / 1000.0)
        
        # Store in Redis for real-time analysis
        inference_record = {
            "request_id": request_id,
            "model": model_name,
            "timestamp": datetime.utcnow().isoformat(),
            "input_features": input_features,
            "prediction": prediction,
            "latency_ms": latency_ms,
            "status": status
        }
        
        redis_client.lpush(
            f"ml_inference_log:{model_name}",
            json.dumps(inference_record)
        )
        
        # Keep last 100k inferences
        redis_client.ltrim(f"ml_inference_log:{model_name}", 0, 99999)
    
    def detect_data_drift(self, model_name: str, window_days: int = 7) -> Dict:
        """Detect input data distribution drift"""
        
        # Get recent inferences
        inferences = self._get_recent_inferences(model_name, window_days)
        
        if not inferences:
            return {"drift_detected": False, "reason": "insufficient_data"}
        
        # Extract features
        features_df = pd.DataFrame([
            inf.get("input_features", {}) for inf in inferences
        ])
        
        if features_df.empty:
            return {"drift_detected": False, "reason": "no_features"}
        
        # Compare to baseline (stored statistics)
        baseline = self._get_feature_baseline(model_name)
        
        drift_detected = False
        drift_metrics = {}
        
        for column in features_df.columns:
            if column not in baseline:
                continue
            
            current_mean = features_df[column].mean()
            current_std = features_df[column].std()
            
            baseline_mean = baseline[column]["mean"]
            baseline_std = baseline[column]["std"]
            
            # Kolmogorov-Smirnov test
            ks_statistic = self._calculate_ks_distance(
                features_df[column].values,
                baseline[column]["samples"]
            )
            
            if ks_statistic > 0.2:  # Threshold
                drift_detected = True
            
            drift_metrics[column] = {
                "current_mean": float(current_mean),
                "baseline_mean": float(baseline_mean),
                "ks_statistic": float(ks_statistic),
                "drifted": ks_statistic > 0.2
            }
        
        if drift_detected:
            self._alert_drift_detected(model_name, drift_metrics)
        
        return {
            "drift_detected": drift_detected,
            "metrics": drift_metrics,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    def detect_prediction_drift(self, model_name: str, window_days: int = 7) -> Dict:
        """Detect output prediction distribution drift"""
        
        inferences = self._get_recent_inferences(model_name, window_days)
        
        if not inferences:
            return {"drift_detected": False}
        
        predictions = [inf.get("prediction", 0.5) for inf in inferences]
        
        current_mean = np.mean(predictions)
        current_std = np.std(predictions)
        
        baseline_mean = redis_client.get(f"ml_baseline:{model_name}:mean")
        baseline_std = redis_client.get(f"ml_baseline:{model_name}:std")
        
        if not baseline_mean:
            # Store new baseline
            redis_client.set(f"ml_baseline:{model_name}:mean", current_mean)
            redis_client.set(f"ml_baseline:{model_name}:std", current_std)
            return {"drift_detected": False, "reason": "baseline_initialized"}
        
        baseline_mean = float(baseline_mean)
        baseline_std = float(baseline_std)
        
        # Check if mean shifted > 2 std deviations
        mean_shift = abs(current_mean - baseline_mean) / (baseline_std + 1e-6)
        
        drift_detected = mean_shift > 2.0
        
        if drift_detected:
            self._alert_prediction_drift(model_name, {
                "current_mean": current_mean,
                "baseline_mean": baseline_mean,
                "std_deviations_shifted": mean_shift
            })
        
        return {
            "drift_detected": drift_detected,
            "mean_shift": mean_shift,
            "current_mean": current_mean,
            "baseline_mean": baseline_mean
        }
    
    def detect_performance_degradation(self, model_name: str) -> Dict:
        """Compare current performance metrics to baseline"""
        
        try:
            # Get production model version
            prod_model = self.mlflow_client.get_latest_versions(
                model_name, stages=["Production"]
            )[0]
            
            # Get baseline metrics
            prod_run = self.mlflow_client.get_run(prod_model.run_id)
            baseline_auc = prod_run.data.metrics.get("test_auc", 0.85)
            baseline_precision = prod_run.data.metrics.get("test_precision", 0.80)
            
            # Evaluate on recent data
            current_auc = self._evaluate_on_recent_data(model_name, 7)
            current_precision = self._evaluate_precision_on_recent_data(model_name, 7)
            
            auc_degradation = baseline_auc - current_auc
            precision_degradation = baseline_precision - current_precision
            
            degradation_detected = (auc_degradation > 0.05 or 
                                   precision_degradation > 0.05)
            
            if degradation_detected:
                self._alert_performance_degradation(model_name, {
                    "baseline_auc": baseline_auc,
                    "current_auc": current_auc,
                    "auc_degradation": auc_degradation,
                    "precision_degradation": precision_degradation
                })
            
            model_auc_gauge.labels(model=model_name).set(current_auc)
            
            return {
                "degradation_detected": degradation_detected,
                "baseline_auc": baseline_auc,
                "current_auc": current_auc,
                "auc_degradation": auc_degradation,
                "precision_degradation": precision_degradation
            }
        
        except Exception as e:
            return {"degradation_detected": False, "error": str(e)}
    
    def check_inference_latency(self, model_name: str, 
                               threshold_ms: float = 100.0) -> Dict:
        """Check if inference latency is within SLA"""
        
        inferences = self._get_recent_inferences(model_name, 1)  # Last 24 hours
        
        if not inferences:
            return {"latency_ok": True}
        
        latencies = [inf.get("latency_ms", 0) for inf in inferences]
        
        p95_latency = np.percentile(latencies, 95)
        p99_latency = np.percentile(latencies, 99)
        max_latency = np.max(latencies)
        
        latency_ok = p95_latency < threshold_ms
        
        if not latency_ok:
            self._alert_latency_degradation(model_name, {
                "p95": p95_latency,
                "p99": p99_latency,
                "max": max_latency,
                "threshold": threshold_ms
            })
        
        return {
            "latency_ok": latency_ok,
            "p95_latency_ms": p95_latency,
            "p99_latency_ms": p99_latency,
            "max_latency_ms": max_latency
        }
    
    def check_model_staleness(self, model_name: str, 
                             max_age_days: int = 30) -> Dict:
        """Check if model is stale and needs retraining"""
        
        try:
            prod_model = self.mlflow_client.get_latest_versions(
                model_name, stages=["Production"]
            )[0]
            
            prod_run = self.mlflow_client.get_run(prod_model.run_id)
            model_age_days = (datetime.utcnow() - 
                             datetime.fromtimestamp(prod_run.info.start_time / 1000)).days
            
            stale = model_age_days > max_age_days
            
            if stale:
                self._alert_model_stale(model_name, {
                    "age_days": model_age_days,
                    "max_age_days": max_age_days
                })
            
            return {
                "stale": stale,
                "age_days": model_age_days,
                "max_age_days": max_age_days
            }
        
        except Exception as e:
            return {"stale": False, "error": str(e)}
    
    def _get_recent_inferences(self, model_name: str, 
                              window_days: int = 1) -> List[Dict]:
        """Get recent inferences from Redis"""
        
        logs = redis_client.lrange(f"ml_inference_log:{model_name}", 0, -1)
        
        inferences = []
        cutoff_time = datetime.utcnow() - timedelta(days=window_days)
        
        for log in logs:
            try:
                inf = json.loads(log)
                inf_time = datetime.fromisoformat(inf["timestamp"])
                if inf_time >= cutoff_time:
                    inferences.append(inf)
            except:
                pass
        
        return inferences
    
    def _get_feature_baseline(self, model_name: str) -> Dict:
        """Get baseline feature statistics"""
        
        baseline_json = redis_client.get(f"ml_baseline_features:{model_name}")
        if baseline_json:
            return json.loads(baseline_json)
        return {}
    
    def _calculate_ks_distance(self, current_samples: np.ndarray,
                              baseline_samples: np.ndarray) -> float:
        """Calculate Kolmogorov-Smirnov distance"""
        
        from scipy.stats import ks_2samp
        ks_stat, _ = ks_2samp(current_samples, baseline_samples)
        return ks_stat
    
    def _evaluate_on_recent_data(self, model_name: str, 
                                days: int = 7) -> float:
        """Evaluate model AUC on recent data"""
        # Implementation would fetch recent ground truth and evaluate
        return 0.85
    
    def _evaluate_precision_on_recent_data(self, model_name: str,
                                          days: int = 7) -> float:
        """Evaluate model precision on recent data"""
        return 0.80
    
    def _alert_drift_detected(self, model_name: str, metrics: Dict):
        """Send alert for detected drift"""
        print(f"ALERT: Data drift detected in {model_name}: {metrics}")
    
    def _alert_prediction_drift(self, model_name: str, metrics: Dict):
        """Send alert for prediction drift"""
        print(f"ALERT: Prediction drift in {model_name}: {metrics}")
    
    def _alert_performance_degradation(self, model_name: str, metrics: Dict):
        """Send alert for performance degradation"""
        print(f"ALERT: Performance degradation in {model_name}: {metrics}")
    
    def _alert_latency_degradation(self, model_name: str, metrics: Dict):
        """Send alert for latency issues"""
        print(f"ALERT: Latency degradation in {model_name}: {metrics}")
    
    def _alert_model_stale(self, model_name: str, metrics: Dict):
        """Send alert for stale model"""
        print(f"ALERT: Model is stale {model_name}: {metrics}")

# Health check job
def run_ml_monitoring():
    """Kubernetes CronJob: Monitor ML model health"""
    
    monitoring = ModelMonitoring()
    
    models_to_monitor = [
        "fraud_detection_v1",
        "chargeback_prediction_v1",
        "merchant_risk_scoring_v1"
    ]
    
    for model_name in models_to_monitor:
        print(f"Monitoring {model_name}...")
        
        # Check all aspects
        monitoring.detect_data_drift(model_name)
        monitoring.detect_prediction_drift(model_name)
        monitoring.detect_performance_degradation(model_name)
        monitoring.check_inference_latency(model_name)
        monitoring.check_model_staleness(model_name)

if __name__ == "__main__":
    run_ml_monitoring()
