# Velora — Database Architecture Document

## Database Strategy

- MySQL 8 (InnoDB, strict mode)
- Shared database with tenant_id
- Global scopes enforce isolation
- Partition large tables monthly

---

## Core Tables

- tenants
- users
- roles
- user_roles
- seller_profiles
- categories
- products
- skus
- inventory
- orders
- order_items
- payments
- ledger_accounts
- ledger_transactions
- ledger_entries
- commission_rules
- commission_records
- refunds
- payouts
- audit_logs

---

## Ledger Structure

### ledger_transactions

- id
- reference_type
- reference_id
- created_at

### ledger_entries

- id
- transaction_id
- account_id
- debit
- credit
- currency
- created_at

Constraints:

- debit = 0 OR credit = 0
- Sum(debit) = Sum(credit) per transaction
- No UPDATE or DELETE

---

## Indexing Strategy

- orders(tenant_id, created_at)
- ledger_entries(account_id, created_at)
- products(tenant_id, status)
- inventory(sku_id)

---

## Data Retention

| Type | Retention |
|------|-----------|
| Financial | 7 years |
| Audit Logs | 7 years |
| Sessions | 24 hours |
| Carts | 7 days |
