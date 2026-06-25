# 🧪 Testing & Verification Guide

---
◀️ **[Previous](CONTRIBUTING.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](RELEASE_CHECKLIST.md)** ▶️
---



This document describes how to execute automated verification scripts, run unit/integration tests, and perform manual data integrity checks.

---

## 1. Relational Database Verification

ARCUS features backend integrity verification scripts written in TypeScript. Run them to verify data constraints:

### A. Run Database Health Audit
Checks user profile mapping completeness, variant inventory consistency, and orders-to-address relationships:
```bash
# From server directory
npx ts-node src/database/healthCheck.ts
```

### B. Validate API Contract Compliance
Audits users, products, and orders DTO responses to ensure contract parity:
```bash
# From server directory
npx ts-node src/database/verifyApiContracts.ts
```

### C. Audit BuildPoints Double-Entry Ledger
Validates that all points wallet balances equal the sum of their ledger transaction records:
```bash
# From server directory
npx ts-node src/database/verifyBuildPoints.ts
```

### D. Validate Stock Levels & Safety Alerts
Checks variant inventories and triggers safety stock notifications for items falling below safety limits:
```bash
# From server directory
npx ts-node src/database/verifyInventory.ts
```

---

## 2. Frontend Development & Linters

Run static code verification commands:

### A. Run ESLint Code Audit
Asserts styling standards, hooks conventions, and imports rules:
```bash
# From workspace root
npm run lint
```

### B. Validate TypeScript Build
Compiles all client code in strict verification mode:
```bash
# From workspace root
npm run build
```


---
◀️ **[Previous](CONTRIBUTING.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](RELEASE_CHECKLIST.md)** ▶️
