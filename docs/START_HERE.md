# 🚀 ARCUS Developer Onboarding Guide

---
◀️ **[Previous](README.md)** | 🔼 **[Parent Section](README.md)** | **[Next](PROJECT_BRAIN.md)** ▶️
---


Welcome to the ARCUS project team! This guide will help you understand the platform, its architecture, and development rules in under 10 minutes.

---

## 1. What is ARCUS?
ARCUS is a full-stack, enterprise-grade commerce and procurement platform designed for the construction industry. It consolidates three main channels:
1. **Materials Marketplace**: Standard retail checkouts and B2B bulk purchases with volume pricing tiers.
2. **Services & Bookings Hub**: A scheduler connecting builders to contractors and professionals.
3. **RFQ Procurement Engine**: An automated bidding workflow where B2B buyers submit requirements, admins reply with versioned quotations, and accepted quotations auto-convert into active orders.

---

## 2. Technology Stack

* **Frontend**: React 19 Single Page Application (SPA), styled with Tailwind CSS, built via Vite.
* **Backend**: Node.js & Express REST API, written in TypeScript.
* **Database**: PostgreSQL (production database on Neon) with check constraints, combined with a local zero-config JSON filesystem fallback (`server/data/db.json`) for offline development.
* **Isomorphic Shared Layer**: Validation schemas and rate limit configurations shared between client and server.

---

## 3. Core Architecture & Development Philosophy

ARCUS is designed around a **service-oriented architecture** backed by a **fully normalized relational schema (3NF)**.

Key principles include:
* **Database is the Source of Truth**: Enforce schema constraints, data types, and check constraints strictly at the database level.
* **Thin Route Handlers**: Route controllers in Express must only parse inputs, call validators, and delegate logic to backend Services.
* **Transactional Ledger Security**: All financial and points transactions must execute in atomic blocks with double-entry audit trails.
* **Failover Parity**: The platform supports a dual-path execution model. If no `DATABASE_URL` is set, the server operates on a local JSON file (`db.json`) which must respond with identical JSON DTO shapes.

---

## 4. Major Modules & Directory Structure

```text
ARCUS/
├── shared/                 # Isomorphic validators and XSS/SQLi sanitizers
├── server/src/             # Express API Server
│   ├── database/           # DDL Migrations, Seeding, and Verification scripts
│   └── modules/            # Services, Models, and Domain Logic
└── src/                    # Frontend React Client
    ├── components/         # Shared views and Page Layouts
    ├── context/            # Auth and Cart React context state
    ├── core/               # Authorization portal resolvers and routing
    └── modules/            # Portal-specific modules (Admin, Business, Professional)
```

---

## 5. Files to Understand First

When onboarding, review these files in order to understand core capabilities:
1. [shared/validation.ts](../shared/validation.ts): Explains input sanitization rules, rate-limiting constraints, and user schemas.
2. [server/src/database/db.ts](../server/src/database/db.ts): Manages connection pooling and switches dynamically between Postgres and local JSON modes.
3. [src/App.tsx](../src/App.tsx): Outlines client-side hash routing, lazy-loaded hubs, and auth wraps.
4. [src/core/auth/PortalResolver.tsx](../src/core/auth/PortalResolver.tsx): Handles role-based redirection to user portal views.

---

## 6. Document Reading Order

For deep-dives into platform modules, review the documentation in this order:
1. [PROJECT_BRAIN.md](PROJECT_BRAIN.md): The primary handbook (contains architecture details, API specs, database Dictionaries, and business rules).
2. [docs/architecture.md](diagrams/architecture.md): Visual overview of routing, filters, and backend service blocks.
3. [docs/database-schema.md](architecture/DATABASE.md): Entity Relation Diagrams (ERD) and foreign key mappings.
4. [docs/validation-rules.md](development/TESTING.md): Input parameter formats and error boundaries.

---

## 7. Crucial Architectural Rules ("DO NOT BREAK")

These rules are non-negotiable and apply to both human developers and AI assistants:
* **API Contracts**: Never modify endpoint responses or change the key casing of returned payloads.
* **DTO Shapes**: Never rename properties in requests or response schemas. Doing so breaks frontend components instantly.
* **Service Layers**: Never bypass the service classes. DB queries and rules must not be written inside Express route handlers.
* **Wallet Adjustments**: Never update wallet balances directly. Always perform double-entry logging in `buildpoints_ledger` and recalculate balance using ledger sum.
* **Inventory Transactions**: Always adjust stocks inside transaction blocks. Check for Safety Stock Alerts on every change.
* **JSON Parity**: All new Postgres queries must have matching fallback JSON adapter implementations in services to support local execution.

For detailed specifications on each module and a full business workflow library, refer directly to the [PROJECT_BRAIN.md](PROJECT_BRAIN.md) handbook!


---
◀️ **[Previous](README.md)** | 🔼 **[Parent Section](README.md)** | **[Next](PROJECT_BRAIN.md)** ▶️
