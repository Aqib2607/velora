# Velora — Functional Specification Document

## Identity & SSO

### Buyer Registration Flow

1. Submit email/password or OAuth
2. Verify email
3. Assign default Buyer role
4. Log audit event

### Seller Onboarding Flow

1. Submit application
2. KYC verification
3. Assign commission tier
4. Activate seller

---

## Catalog Service

### Product States

Draft → Active → Suspended → Archived

Rules:

- Only admin may suspend
- Archived products cannot be reactivated

---

## Inventory Service

### Soft Reserve

- Triggered on cart add
- 15-minute expiry
- Stored in Redis

### Hard Lock

- Triggered after payment confirmation
- Permanent decrement

Constraint:

- Quantity must never go below zero

---

## Order State Machine

Pending → Paid → Shipped → Delivered → Completed  
          ↘ Failed  
          ↘ Refunded  
          ↘ Cancelled

Rules:

- Idempotency key required
- Payment must be confirmed before ledger insert

---

## Ledger Rules

- Append-only
- Double-entry required
- No UPDATE or DELETE permitted
- Reversals via compensating entries

---

## Refund Workflow

1. Initiate RMA
2. Validate eligibility
3. Process refund via gateway
4. Insert compensating ledger entries
5. Adjust payout balance

---

## Role Permissions (Simplified)

| Action | Buyer | Seller | Admin |
|--------|--------|--------|--------|
| Create Product | ❌ | ✔ | ✔ |
| Modify Commission | ❌ | ❌ | ✔ |
| Refund Order | Request | Limited | ✔ |
