# 🛠️ Technical Debt Registry & Terminology Glossary

---
◀️ **[Previous](PERFORMANCE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ROADMAP.md)** ▶️
---

## Technical Debt Log

## 23.2. In Progress Work (Current Sprint 5)
* **Digital RFQ Pipeline**: Standardize RFQ forms, quotations revisions matrices, and quotation conversion sequence routes.
* **Search Telemetry**: Expand search analytics reporting and query logging.

## 23.3. Next Sprint Goals (Sprint 6)
* **Verified Profiles Scope**: Launch subcontractor visit logs scheduling calendars.
* **Admin Custom Settings Override**: Connect settings schema controls to Express API command endpoints.

## 23.4. Future Roadmap Items
* **Logistics Auto-Routing**: Connect Pin-code tables to courier shipping calculators.
* **B2B net-30 terms**: Support net-30 invoice credit validations in checkout services.

## 23.5. Technical Debt and Limitations
* **JSON File Write Concurrency**: Local db.json mode is single-threaded and lacks multi-client lockups.
* **Mock Calendars**: Professionals scheduling displays use mock calendars in offline fallback mode.


---

---

# Chapter 25: Protected Components

## 25.1. Critical Systems List
The following systems, directories, and schemas must **NEVER** be modified without explicit approval:

* **Authentication System**:
  - *Files*: [AuthPage.tsx](../../src/components/AuthPage.tsx), [PortalResolver.tsx](../../src/core/auth/PortalResolver.tsx)
  - *Reason*: Directs entry routing. Failures here lock users out.
* **JSON Web Token (JWT) Configuration**:
  - *Files*: [index.ts](../../server/src/index.ts#L1430)
  - *Reason*: Signing and keys are standard across services.
* **Granular Permission Engine**:
  - *Files*: [validation.ts](../../shared/validation.ts)
  - *Reason*: Prevents privilege escalation. Gaps here expose admin panels.
* **BuildPoints Ledger & Wallet**:
  - *Files*: [verifyBuildPoints.ts](../../server/src/database/verifyBuildPoints.ts)
  - *Reason*: Relies on atomic double-entry checks. Mismatches invalidate loyalty balances.
* **Inventory Safety Reservations**:
  - *Files*: [verifyInventory.ts](../../server/src/database/verifyInventory.ts)
  - *Reason*: Enforces safety allocations to block double-sales.
* **Quotation Versioning**:
  - *Files*: [QuotationService.ts](../../server/src/modules/rfq/QuotationService.ts)
  - *Reason*: Versions negotiation history. Changing names breaks previous quotes lookup.
* **RFQ Conversion Sequence**:
  - *Files*: [RFQService.ts](../../server/src/modules/rfq/RFQService.ts)
  - *Reason*: Transitions quotes to orders atomically.
* **Order Numbering System**:
  - *Files*: [Order.ts](../../server/src/modules/orders/Order.ts)
  - *Reason*: Needed for tax invoice audit trails.
* **Database IDs Format**:
  - *Files*: [migrations.ts](../../server/src/database/migrations.ts)
  - *Reason*: Key formats match unique identifiers prefixes.
* **Normalized 3NF Schemas**:
  - *Files*: [initDb.ts](../../server/src/database/initDb.ts)
  - *Reason*: Segregates profile layers.
* **System Audit Logging**:
  - *Files*: [AuditLogService.ts](../../server/src/modules/analytics/AuditLogService.ts)
  - *Reason*: Guarantees traceability of override actions.
* **Idempotent Migration Scripts**:
  - *Files*: [migrations.ts](../../server/src/database/migrations.ts)
  - *Reason*: Assures safe, repeatable database deployments.


---

---

# Chapter 26: Technical and Business Terminology Glossary

* **RFQ (Request for Quote)**: A procurement specification sheet detailing material needs, delivery codes, and budgets.
* **MOQ (Minimum Order Quantity)**: The lowest quantity limit required to checkout a variant SKU.
* **Variant**: A specific SKU option of a parent product (e.g. Havells 2.5sqmm Wire).
* **SKU (Stock Keeping Unit)**: Unique code mapping to a specific materials variant.
* **BuildPoints**: Loyalty credits earned on order payments.
* **Quotation**: A custom binding price offer sent by admins responding to a buyer's RFQ.
* **Procurement**: The business purchasing pipeline (RFQ $\rightarrow$ quote review $\rightarrow$ convert order $\rightarrow$ invoice).
* **Professional**: A trade subcontractor listed in the service bookings directory.
* **Leaf Category**: The lowest partition of product categories directory, holding products directly.
* **JSON Fallback**: Zero-config filesystem data storage (`db.json`) used for offline development.
* **ADR (Architecture Decision Record)**: Log documenting architectural selections, options, and tradeoffs.
* **Normalization**: Relational structure separating profile tables to block duplicate records.
* **Portal Resolver**: Route redirector routing users to specific views (Admin, Business, Individual, Professional).
* **Ledger**: The immutable transaction table recording credit/debit loyalty deltas.
* **Reservation**: Locking variant stock at checkout for 30 minutes to prevent double-selling.
* **GST**: Indirect commercial tax (18% on materials).
* **Bulk Order**: Bulk materials procurement subject to volume price scales.


---

---
◀️ **[Previous](PERFORMANCE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ROADMAP.md)** ▶️
