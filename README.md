# Velora

Velora is a scalable, distributed, multi-tenant global marketplace platform engineered for high-throughput commerce with financial-grade integrity, combining B2C and B2B2C commerce.

## System Overview

- **Multi-tenant architecture**: `tenant_id` enforced globally across the shared database.
- **Event-driven processing**: Built with a Kafka-ready architecture.
- **Immutable double-entry ledger**: Financial transactions balance (debit = credit) with no UPDATE or DELETE allowed.
- **Idempotent order processing**: Prevents duplicate charges.
- **CQRS separation**: Writes handle by MySQL; Reads by OpenSearch.
- **Escrow-based payment model**: For secure buyer-seller transactions.

## Core Modules

- **Identity & SSO, Tenant Management**
- **Catalog, Inventory, Cart, Order Processing**
- **Payment, Ledger, Commission Engine**
- **Refund/RMA, Payouts, Reporting**

## User Roles

- **Buyer**: Tenant-scoped browsing, purchasing, and refunding.
- **Seller / Seller Pro**: Cross-tenant catalog management, fulfillment, and analytics.
- **Marketplace Admin**: Tenant-scoped seller moderation and commission management.
- **Finance Admin**: Global ledger and payout oversight.
- **Super Admin**: Full global system visibility.

## Tech Stack

### Frontend

- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, PostCSS (Support for Light/Dark themes, Custom UI system)
- **Routing**: React Router v6
- **State Management**: Zustand (client state), React Query (server state)
- **API Client**: Axios

### Backend

- **Framework**: Laravel 11
- **Auth**: Sanctum authentication
- **Design**: Modular architecture, Policy-based RBAC

### Data Layer & Infrastructure

- **Database**: MySQL 8 (InnoDB, strict mode, partitioned monthly)
- **Caching & Queue**: Redis (sessions, cart, queue)
- **Search**: OpenSearch (read model, full-text search)
- **Infrastructure**: AWS (RDS, ElastiCache, EKS, S3, CloudFront), Terraform, Docker containers
- **Observability**: Prometheus, Grafana, ELK stack, Jaeger tracing
- **CI/CD**: PHPUnit, PHPStan, Docker build to ECR, Rolling deployments

## Constraints & Compliance

- **PCI & GDPR**: Tokenized gateway, export & deletion support.
- **Performance targets**: 99.9% Checkout uptime, <50ms Search latency, up to 1,500 Orders/min.
- **Data Retention**: 7 years for financial and audit logs.

## Getting Started

### Prerequisites

- Node.js (v18+) & npm
- PHP 8.2+ & Composer
- MySQL 8, Redis

### Installation & Execution

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install frontend dependencies
npm install

# Start the frontend development server
npm run dev
```
