#!/usr/bin/env python3
"""
Phase H.4 & H.5: SRE, Incident Management & Fraud Operations
"""

import json
import uuid
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)

class IncidentManagement:
    def __init__(self):
        self.active_incidents = {}

    def classify_and_route(self, alert_data):
        severity = "SEV-4"
        routing = "general_ops"
        
        error_rate = alert_data.get('error_rate', 0)
        affected_users = alert_data.get('affected_users', 0)

        if error_rate > 0.10 or affected_users > 10000:
            severity = "SEV-1"
            routing = "pagerduty_exec_escalation"
        elif error_rate > 0.05 or affected_users > 1000:
            severity = "SEV-2"
            routing = "pagerduty_sre_oncall"
        elif error_rate > 0.01:
            severity = "SEV-3"
            routing = "slack_ops_channel"

        incident_id = f"INC-{str(uuid.uuid4())[:8]}"
        
        incident = {
            "incident_id": incident_id,
            "severity": severity,
            "routing": routing,
            "status": "investigating",
            "detected_at": datetime.utcnow().isoformat(),
            "telemetry": alert_data
        }
        
        self.active_incidents[incident_id] = incident
        logging.info(f"Created {severity} Incident {incident_id} routed to {routing}")
        return incident

    def generate_postmortem_template(self, incident_id):
        incident = self.active_incidents.get(incident_id)
        if not incident:
            return {"error": "Incident not found"}
            
        return {
            "incident_id": incident_id,
            "summary": "Brief description of outage",
            "impact": f"{incident['severity']} outage affecting X users",
            "root_cause": "TBD",
            "timeline": [incident['detected_at']],
            "action_items": []
        }

class FraudOperations:
    def __init__(self):
        self.investigations = {}
        
    def flag_for_review(self, transaction_data, ml_risk_score):
        if ml_risk_score > 0.85:
            # Auto-decline
            return {"action": "decline", "reason": "high_fraud_probability"}
            
        if ml_risk_score > 0.60:
            # Flag for manual review
            inv_id = f"FRD-{str(uuid.uuid4())[:8]}"
            self.investigations[inv_id] = {
                "transaction_id": transaction_data['id'],
                "risk_score": ml_risk_score,
                "status": "pending_analyst_review",
                "evidence_collected": ["ip_match", "device_fingerprint", "velocity_check"],
                "deadline": (datetime.utcnow() + timedelta(hours=2)).isoformat()
            }
            return {"action": "manual_review", "investigation_id": inv_id}
            
        return {"action": "approve", "reason": "low_risk"}

if __name__ == "__main__":
    im = IncidentManagement()
    alert = {"error_rate": 0.12, "affected_users": 15000, "service": "payment_gateway"}
    inc = im.classify_and_route(alert)
    print(json.dumps(inc, indent=2))
    
    fo = FraudOperations()
    tx = {"id": "tx_998877", "amount": 1500, "user_id": "usr_123"}
    res = fo.flag_for_review(tx, 0.75)
    print(json.dumps(res, indent=2))
