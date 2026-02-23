# Velora — Tech Stack Document

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router v6
- Zustand (state)
- React Query (server state)
- Axios

---

## Backend

- Laravel 11
- Sanctum authentication
- Modular architecture
- Policy-based RBAC

---

## Database

- MySQL 8 (InnoDB)
- Strict foreign keys
- Tenant isolation via tenant_id
- Immutable ledger

---

## Caching & Queue

- Redis (sessions, cart, queue)
- Kafka-ready architecture

---

## Search

- OpenSearch (read model)
- Full-text search
- Aggregations

---

## Infrastructure

- AWS
  - RDS (MySQL)
  - ElastiCache (Redis)
  - EKS (Kubernetes)
  - S3 (media)
  - CloudFront (CDN)
- Terraform (IaC)
- Docker containers

---

## Observability

- Prometheus
- Grafana
- ELK stack
- Jaeger tracing

---

## CI/CD

- PHPUnit
- PHPStan
- Security scanning
- Docker build → ECR
- Rolling deployment
