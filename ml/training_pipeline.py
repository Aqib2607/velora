"""
Velora ML Model Training Pipeline - Automated retraining with drift detection
"""

import os
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, precision_score, recall_score, f1_score
import joblib
import mlflow
import mlflow.sklearn
from feast import FeatureStore
from typing import Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class ModelTrainingPipeline:
    
    def __init__(self):
        self.fs = FeatureStore(repo_path="ml/feature_store_config.yaml")
        mlflow.set_tracking_uri(os.getenv("MLFLOW_TRACKING_URI", "gs://velora-mlflow"))
        mlflow.set_registry_uri(os.getenv("MLFLOW_REGISTRY_URI", "gs://velora-ml-registry"))
    
    def train_fraud_detection_model(self, lookback_days: int = 90):
        """Train fraud detection model on historical data"""
        
        with mlflow.start_run(run_name="fraud_detection_retraining"):
            mlflow.log_param("lookback_days", lookback_days)
            
            # Get training data (last N days)
            start_date = datetime.utcnow() - timedelta(days=lookback_days)
            training_data = self._fetch_training_data("fraud", start_date)
            
            if training_data.empty:
                logger.error("No training data available")
                return None
            
            logger.info(f"Training on {len(training_data)} samples")
            mlflow.log_metric("training_samples", len(training_data))
            
            # Split data
            X = training_data.drop(["is_fraud"], axis=1)
            y = training_data["is_fraud"]
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            
            # Train model
            model = GradientBoostingClassifier(
                n_estimators=200,
                learning_rate=0.1,
                max_depth=8,
                min_samples_split=10,
                random_state=42,
                n_jobs=-1
            )
            
            model.fit(X_train_scaled, y_train)
            
            # Evaluate
            train_auc = roc_auc_score(y_train, model.predict_proba(X_train_scaled)[:, 1])
            test_auc = roc_auc_score(y_test, model.predict_proba(X_test_scaled)[:, 1])
            test_precision = precision_score(y_test, model.predict(X_test_scaled))
            test_recall = recall_score(y_test, model.predict(X_test_scaled))
            test_f1 = f1_score(y_test, model.predict(X_test_scaled))
            
            logger.info(f"Train AUC: {train_auc:.4f}, Test AUC: {test_auc:.4f}")
            
            # Log metrics
            mlflow.log_metric("train_auc", train_auc)
            mlflow.log_metric("test_auc", test_auc)
            mlflow.log_metric("test_precision", test_precision)
            mlflow.log_metric("test_recall", test_recall)
            mlflow.log_metric("test_f1", test_f1)
            
            # Check for overfitting
            if train_auc - test_auc > 0.05:
                logger.warning("Potential overfitting detected")
                mlflow.log_param("overfitting_risk", "high")
            
            # Register model if performance is good
            if test_auc > 0.85:
                mlflow.sklearn.log_model(model, "fraud_model")
                mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/fraud_model", "fraud_detection_v1")
                logger.info("Model registered successfully")
            else:
                logger.warning(f"Model AUC {test_auc:.4f} below threshold of 0.85")
            
            return {"model": model, "scaler": scaler, "metrics": {
                "train_auc": train_auc,
                "test_auc": test_auc,
                "precision": test_precision,
                "recall": test_recall,
                "f1": test_f1
            }}
    
    def train_chargeback_prediction_model(self, lookback_days: int = 180):
        """Train chargeback prediction model"""
        
        with mlflow.start_run(run_name="chargeback_prediction_retraining"):
            mlflow.log_param("lookback_days", lookback_days)
            
            start_date = datetime.utcnow() - timedelta(days=lookback_days)
            training_data = self._fetch_training_data("chargeback", start_date)
            
            if training_data.empty:
                logger.error("No training data available")
                return None
            
            X = training_data.drop(["has_chargeback"], axis=1)
            y = training_data["has_chargeback"]
            
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            model = RandomForestClassifier(
                n_estimators=150,
                max_depth=12,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            )
            
            model.fit(X_train, y_train)
            
            test_auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
            test_precision = precision_score(y_test, model.predict(X_test))
            test_recall = recall_score(y_test, model.predict(X_test))
            
            mlflow.log_metric("test_auc", test_auc)
            mlflow.log_metric("test_precision", test_precision)
            mlflow.log_metric("test_recall", test_recall)
            
            if test_auc > 0.80:
                mlflow.sklearn.log_model(model, "chargeback_model")
                mlflow.register_model(f"runs:/{mlflow.active_run().info.run_id}/chargeback_model", "chargeback_prediction_v1")
            
            return {"model": model, "metrics": {"test_auc": test_auc}}
    
    def detect_model_drift(self, model_name: str, threshold: float = 0.05) -> bool:
        """Detect if model performance has drifted"""
        
        # Compare current performance on new data vs training data
        current_perf = self._evaluate_on_recent_data(model_name, days=7)
        baseline_perf = self._get_baseline_performance(model_name)
        
        drift_magnitude = abs(current_perf - baseline_perf)
        
        if drift_magnitude > threshold:
            logger.warning(f"Model drift detected: {drift_magnitude:.4f} > {threshold}")
            mlflow.log_metric(f"{model_name}_drift_magnitude", drift_magnitude)
            return True
        
        return False
    
    def _fetch_training_data(self, data_type: str, start_date: datetime) -> pd.DataFrame:
        """Fetch training data from data warehouse"""
        
        if data_type == "fraud":
            query = f"""
                SELECT 
                    merchant_fraud_score,
                    merchant_chargeback_rate,
                    customer_chargeback_history,
                    customer_purchase_frequency_7d,
                    transaction_velocity_1h,
                    transaction_amount_deviation_from_avg,
                    product_fraud_indicator,
                    amount,
                    (billing_country != shipping_country) as country_mismatch,
                    is_fraud
                FROM transactions
                WHERE created_at >= '{start_date}'
                AND is_fraud IS NOT NULL
            """
        elif data_type == "chargeback":
            query = f"""
                SELECT 
                    merchant_chargeback_rate,
                    merchant_dispute_rate,
                    customer_chargeback_history,
                    customer_return_rate,
                    transaction_amount_deviation_from_avg,
                    amount,
                    (product_category IN ('electronics', 'jewelry')) as high_risk_category,
                    has_chargeback
                FROM transactions
                WHERE created_at >= '{start_date}'
                AND has_chargeback IS NOT NULL
            """
        
        # Execute query against BigQuery or data warehouse
        from google.cloud import bigquery
        client = bigquery.Client()
        df = client.query(query).to_dataframe()
        
        return df
    
    def _evaluate_on_recent_data(self, model_name: str, days: int = 7) -> float:
        """Evaluate model performance on recent data"""
        
        # Load current model from registry
        model = mlflow.sklearn.load_model(f"models:/{model_name}/production")
        
        # Get recent test data
        data = self._fetch_training_data("fraud" if "fraud" in model_name else "chargeback", 
                                         datetime.utcnow() - timedelta(days=days))
        
        if data.empty:
            return 0.0
        
        X = data.drop([data.columns[-1]], axis=1)
        y = data[data.columns[-1]]
        
        if len(y) < 10:
            return 0.0
        
        auc = roc_auc_score(y, model.predict_proba(X)[:, 1])
        return auc
    
    def _get_baseline_performance(self, model_name: str) -> float:
        """Get baseline performance from model metadata"""
        
        client = mlflow.tracking.MlflowClient()
        model_version = client.get_latest_versions(model_name, stages=["Production"])[0]
        
        runs = client.search_runs(
            experiment_ids=[model_version.run_id],
            max_results=1
        )
        
        if runs:
            metrics = runs[0].data.metrics
            return metrics.get("test_auc", 0.5)
        
        return 0.5

def retrain_models_on_schedule():
    """
    Kubernetes CronJob: Retrain models daily
    Runs in ml-training-pod (CPU optimized)
    """
    pipeline = ModelTrainingPipeline()
    
    try:
        # Check for drift first
        fraud_drifted = pipeline.detect_model_drift("fraud_detection_v1")
        cb_drifted = pipeline.detect_model_drift("chargeback_prediction_v1")
        
        # Retrain if needed
        if fraud_drifted:
            logger.info("Retraining fraud detection model due to drift")
            pipeline.train_fraud_detection_model()
        
        if cb_drifted:
            logger.info("Retraining chargeback prediction model due to drift")
            pipeline.train_chargeback_prediction_model()
        
        # Weekly full retrain
        today = datetime.utcnow().weekday()
        if today == 0:  # Monday
            logger.info("Weekly retraining initiated")
            pipeline.train_fraud_detection_model()
            pipeline.train_chargeback_prediction_model()
    
    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        raise

if __name__ == "__main__":
    retrain_models_on_schedule()
