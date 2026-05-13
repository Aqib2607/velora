"""
Phase 6: Enterprise IAM & Governance - SCIM, organization hierarchy, RBAC
"""

from typing import Dict, List
from datetime import datetime
from enum import Enum

class OrganizationRole(str, Enum):
    ADMIN = "admin"
    OWNER = "owner"
    MANAGER = "manager"
    MEMBER = "member"
    VIEWER = "viewer"

class EnterpriseIAM:
    """Multi-tenant identity and access management"""
    
    def create_organization(self, org_name: str, admin_user_id: str) -> Dict:
        """Create enterprise organization"""
        return {
            "org_id": f"org_{datetime.utcnow().timestamp()}",
            "name": org_name,
            "created_by": admin_user_id,
            "created_at": datetime.utcnow().isoformat(),
            "status": "active",
            "features": ["scim", "sso", "audit_logs", "custom_roles"]
        }
    
    def create_department(self, org_id: str, dept_name: str, parent_dept: str = None) -> Dict:
        """Create department hierarchy"""
        return {
            "dept_id": f"dept_{datetime.utcnow().timestamp()}",
            "org_id": org_id,
            "name": dept_name,
            "parent": parent_dept,
            "members": [],
            "roles": ["manager", "analyst", "operator"],
            "permissions": self._get_default_permissions(),
            "created_at": datetime.utcnow().isoformat()
        }
    
    def provision_user_scim(self, org_id: str, user_data: Dict) -> Dict:
        """Provision user via SCIM"""
        return {
            "user_id": f"user_{datetime.utcnow().timestamp()}",
            "org_id": org_id,
            "email": user_data["email"],
            "name": user_data["name"],
            "department": user_data.get("department"),
            "role": user_data.get("role", "member"),
            "status": "active",
            "mfa_enabled": True,
            "provisioned_at": datetime.utcnow().isoformat()
        }
    
    def create_custom_role(self, org_id: str, role_name: str, 
                          permissions: List[str]) -> Dict:
        """Create custom role with specific permissions"""
        return {
            "role_id": f"role_{datetime.utcnow().timestamp()}",
            "org_id": org_id,
            "name": role_name,
            "permissions": permissions,
            "assignable_to": ["users", "groups"],
            "created_at": datetime.utcnow().isoformat()
        }
    
    def assign_role_with_inheritance(self, user_id: str, role: str, 
                                     scope: str, inherit: bool = True) -> Dict:
        """Assign role with permission inheritance"""
        return {
            "user_id": user_id,
            "role": role,
            "scope": scope,  # org, department, team, resource
            "inherit_to_children": inherit,
            "assigned_at": datetime.utcnow().isoformat(),
            "audit_log": True
        }
    
    def enforce_sso(self, org_id: str, sso_provider: str) -> Dict:
        """Enforce SSO for organization"""
        return {
            "org_id": org_id,
            "sso_provider": sso_provider,  # okta, azure_ad, google_workspace
            "enforced": True,
            "password_policy": {
                "min_length": 12,
                "require_special": True,
                "require_mfa": True
            },
            "session_timeout": 3600,
            "enabled_at": datetime.utcnow().isoformat()
        }
    
    def create_audit_log_entry(self, org_id: str, user_id: str, 
                              action: str, resource: str, 
                              result: str = "success") -> Dict:
        """Create compliance audit log"""
        return {
            "audit_id": f"audit_{datetime.utcnow().timestamp()}",
            "org_id": org_id,
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "result": result,
            "ip_address": None,
            "timestamp": datetime.utcnow().isoformat(),
            "immutable": True
        }
    
    def _get_default_permissions(self) -> List[str]:
        return [
            "read:transactions",
            "read:reports",
            "write:support_tickets",
            "read:merchant_analytics"
        ]

class FinOpsGovernance:
    """Cloud cost governance and optimization"""
    
    def track_cloud_costs(self, namespace: str) -> Dict:
        """Track costs per namespace/team"""
        return {
            "namespace": namespace,
            "daily_cost": 0,  # Would fetch from cloud provider
            "monthly_estimate": 0,
            "services": {
                "compute": 0,
                "storage": 0,
                "network": 0,
                "database": 0,
                "ml_gpu": 0
            },
            "budget_limit": 50000,
            "cost_anomalies": []
        }
    
    def set_cost_alerts(self, namespace: str, threshold_percent: int = 80) -> Dict:
        """Set cost alerts at threshold"""
        return {
            "namespace": namespace,
            "threshold_percent": threshold_percent,
            "alert_channels": ["slack", "email", "pagerduty"],
            "enabled": True,
            "created_at": datetime.utcnow().isoformat()
        }
    
    def recommend_cost_optimization(self, resource_type: str) -> Dict:
        """Get cost optimization recommendations"""
        recommendations = {
            "compute": ["Right-size instances", "Use spot instances", "Enable autoscaling"],
            "storage": ["Compress old logs", "Use cold storage", "Remove orphaned volumes"],
            "network": ["Use CDN", "Optimize transfer", "Combine NAT gateways"],
            "database": ["Optimize indexes", "Enable read replicas", "Archive old data"]
        }
        
        return {
            "resource_type": resource_type,
            "recommendations": recommendations.get(resource_type, []),
            "estimated_savings": "15-25%",
            "generated_at": datetime.utcnow().isoformat()
        }

if __name__ == "__main__":
    iam = EnterpriseIAM()
    
    # Create organization
    org = iam.create_organization("Acme Corp", "admin@acme.com")
    print(f"Created org: {org}")
    
    # Create department
    sales_dept = iam.create_department(org["org_id"], "Sales")
    print(f"Created dept: {sales_dept}")
    
    # Provision user via SCIM
    user = iam.provision_user_scim(org["org_id"], {
        "email": "john@acme.com",
        "name": "John Doe",
        "department": sales_dept["dept_id"]
    })
    print(f"Provisioned user: {user}")
