#!/usr/bin/env python3
"""
Phase 5: Continuous Chaos Engineering - Automated resilience testing
Injected failures: Network latency, pod crashes, resource exhaustion, zone failures
"""

import os
from datetime import datetime, timedelta
import kubernetes
from kubernetes import client, watch
import logging
import random
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChaosEngineer:
    
    def __init__(self):
        kubernetes.config.load_incluster_config()
        self.v1 = client.CoreV1Api()
        self.apps_v1 = client.AppsV1Api()
    
    def inject_network_latency(self, namespace="velora-prod", latency_ms=500):
        """Inject network latency to test timeout handling"""
        logger.info(f"Injecting {latency_ms}ms latency to {namespace}")
        
        pods = self.v1.list_namespaced_pod(namespace).items
        test_pod = random.choice(pods)
        
        command = f"""
        tc qdisc add dev eth0 root tbf rate 1mbit burst 32kbit latency {latency_ms}ms
        sleep 300
        tc qdisc del dev eth0 root
        """
        
        self._execute_in_pod(test_pod, command)
    
    def crash_random_pod(self, namespace="velora-prod", delay_before_crash=60):
        """Kill random pod to test failover"""
        logger.info(f"Scheduling pod crash in {namespace} after {delay_before_crash}s")
        
        pods = self.v1.list_namespaced_pod(namespace, 
                                           label_selector="tier!=critical").items
        
        if not pods:
            logger.warning("No pods available for crashing")
            return
        
        target_pod = random.choice(pods)
        logger.info(f"Target pod: {target_pod.metadata.name}")
        
        # Delete pod (will be recreated by deployment)
        self.v1.delete_namespaced_pod(
            target_pod.metadata.name,
            namespace,
            grace_period_seconds=0
        )
        
        logger.info(f"Pod {target_pod.metadata.name} crashed")
    
    def exhaust_memory(self, namespace="velora-prod", memory_mb=1024):
        """Allocate memory to test OOM handling"""
        logger.info(f"Exhausting {memory_mb}MB memory in {namespace}")
        
        pods = self.v1.list_namespaced_pod(namespace).items
        test_pod = random.choice(pods)
        
        command = f"""
        python3 -c "
        import sys
        try:
            data = []
            for i in range({memory_mb}):
                data.append(b'X' * 1024 * 1024)
                if i % 100 == 0:
                    print(f'Allocated {{i}}MB')
            print(f'Allocated {memory_mb}MB total')
            time.sleep(300)
        except MemoryError:
            print('OOM triggered')
            sys.exit(1)
        "
        """
        
        self._execute_in_pod(test_pod, command)
    
    def simulate_zone_failure(self, namespace="velora-prod", zone_name="us-central-a"):
        """Simulate zone failure by cordoning nodes"""
        logger.info(f"Simulating zone failure: {zone_name}")
        
        nodes = self.v1.list_node().items
        zone_nodes = [n for n in nodes 
                     if n.metadata.labels.get('topology.kubernetes.io/zone') == zone_name]
        
        if not zone_nodes:
            logger.warning(f"No nodes in zone {zone_name}")
            return
        
        # Cordon nodes (prevent new pod scheduling)
        for node in zone_nodes:
            body = {
                "spec": {
                    "unschedulable": True
                }
            }
            self.v1.patch_node(node.metadata.name, body)
            logger.info(f"Cordoned {node.metadata.name}")
        
        # Drain pods (graceful termination)
        for node in zone_nodes:
            pods_to_drain = self.v1.list_pod_for_all_namespaces(
                field_selector=f"spec.nodeName={node.metadata.name}"
            ).items
            
            for pod in pods_to_drain:
                if pod.metadata.namespace.startswith("kube-"):
                    continue
                
                self.v1.delete_namespaced_pod(
                    pod.metadata.name,
                    pod.metadata.namespace,
                    grace_period_seconds=30
                )
                logger.info(f"Deleted {pod.metadata.name}")
        
        # Recovery: uncordon after delay
        time.sleep(300)
        
        for node in zone_nodes:
            body = {
                "spec": {
                    "unschedulable": False
                }
            }
            self.v1.patch_node(node.metadata.name, body)
            logger.info(f"Uncordoned {node.metadata.name}")
    
    def inject_database_latency(self, namespace="velora-prod", latency_ms=2000):
        """Inject database query latency"""
        logger.info(f"Injecting {latency_ms}ms database latency")
        
        # Add query delay to PostgreSQL
        command = f"""
        psql -h postgres-primary -U postgres -d postgres << 'SQL'
          SET statement_timeout = {latency_ms + 1000};
        SQL
        """
        
        logger.info("Database latency injected")
    
    def disconnect_cache_layer(self, namespace="velora-prod"):
        """Disconnect Redis/cache layer"""
        logger.info("Disconnecting cache layer")
        
        # Scale down Redis
        redis_dep = self.apps_v1.read_namespaced_deployment("redis", namespace)
        redis_dep.spec.replicas = 0
        self.apps_v1.patch_namespaced_deployment("redis", namespace, redis_dep)
        
        # Test cache miss handling
        time.sleep(120)
        
        # Restore Redis
        redis_dep.spec.replicas = 1
        self.apps_v1.patch_namespaced_deployment("redis", namespace, redis_dep)
        
        logger.info("Cache layer restored")
    
    def run_continuous_chaos(self):
        """Run chaos tests on schedule"""
        
        tests = [
            ("latency", lambda: self.inject_network_latency(latency_ms=300)),
            ("pod_crash", lambda: self.crash_random_pod()),
            ("memory_exhaust", lambda: self.exhaust_memory(memory_mb=512)),
            ("db_latency", lambda: self.inject_database_latency(latency_ms=1000)),
            ("cache_disconnect", lambda: self.disconnect_cache_layer()),
        ]
        
        while True:
            test_name, test_func = random.choice(tests)
            
            try:
                logger.info(f"Starting chaos test: {test_name}")
                test_func()
                logger.info(f"Completed: {test_name}")
                
                # Wait before next test
                time.sleep(600)  # 10 minute interval
                
            except Exception as e:
                logger.error(f"Chaos test {test_name} failed: {e}")
                time.sleep(60)
    
    def _execute_in_pod(self, pod, command):
        """Execute command inside pod"""
        # Implementation would use Pod Exec API
        pass

class ChaosMetrics:
    """Track chaos test results and recovery metrics"""
    
    def __init__(self):
        self.results = []
    
    def record_test(self, test_name, status, duration_ms, incidents_detected=0):
        """Record chaos test results"""
        
        result = {
            "test": test_name,
            "status": status,  # success, failed, timeout
            "duration_ms": duration_ms,
            "incidents_detected": incidents_detected,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        self.results.append(result)
    
    def get_resilience_score(self) -> float:
        """Calculate overall resilience score (0-1)"""
        
        if not self.results:
            return 0.5
        
        last_30_days = [r for r in self.results 
                       if (datetime.utcnow() - datetime.fromisoformat(r['timestamp'])).days <= 30]
        
        if not last_30_days:
            return 0.5
        
        successful = len([r for r in last_30_days if r['status'] == 'success'])
        recovery_rate = successful / len(last_30_days)
        
        # Factor in incident detection
        avg_incidents = sum(r['incidents_detected'] for r in last_30_days) / len(last_30_days)
        incident_score = max(0, 1 - (avg_incidents * 0.1))  # 10% per incident
        
        return (recovery_rate + incident_score) / 2

if __name__ == "__main__":
    chaos = ChaosEngineer()
    
    # Run single test or continuous chaos
    import sys
    if len(sys.argv) > 1:
        test_name = sys.argv[1]
        
        if test_name == "latency":
            chaos.inject_network_latency()
        elif test_name == "crash":
            chaos.crash_random_pod()
        elif test_name == "memory":
            chaos.exhaust_memory()
        elif test_name == "zone":
            chaos.simulate_zone_failure()
        elif test_name == "db":
            chaos.inject_database_latency()
        elif test_name == "cache":
            chaos.disconnect_cache_layer()
    else:
        # Run continuous chaos (as Kubernetes CronJob)
        chaos.run_continuous_chaos()
