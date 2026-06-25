# 03_RFQ_DATA_MODEL — RFQ Suite Database & Schema Design

## Document Metadata
* **Title**: ARCUS RFQ Data Model Specification
* **Purpose**: Defines database tables, schemas, relations, audit structures, and status lifecycle flags for the RFQ Workspace module.
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Lead Database Architect / Data Engineer
* **Related Documents**:
  - [02_RFQ_WORKFLOWS.md](file:///d:/Claude%20Code/Arcus/docs/rfq/02_RFQ_WORKFLOWS.md)
  - [06_RFQ_API_PLAN.md](file:///d:/Claude%20Code/Arcus/docs/rfq/06_RFQ_API_PLAN.md)
* **Estimated Reading Time**: 10 minutes

---

## 1. Entity Relationship Schema

The RFQ Workspace introduces tables normalization to support detailed item structures and multi-version quotes:

```
┌──────────────┐       1:N       ┌──────────────┐
│     rfqs     ├────────────────►│  rfq_items   │
└──────┬───────┘                 └──────────────┘
       │
       │ 1:N
       ▼
┌──────────────┐       1:N       ┌────────────────┐
│  quotations  ├────────────────►│quotation_items │
└──────┬───────┘                 └────────────────┘
       │
       │ 1:N
       ├────────────────────────► [ rfq_attachments ]
       │ 1:N
       ├────────────────────────► [ rfq_comments ]
       │ 1:N
       └────────────────────────► [ rfq_activity_logs ]
```

---

## 2. Table Schemas & Definitions

### A. Table: `rfqs`
Stores the parent Request For Quote header records.
* `id`: UUID (Primary Key, default: `gen_random_uuid()`)
* `rfq_number`: VARCHAR (e.g. `RFQ-2026-0001`, unique constraint)
* `buyer_id`: UUID (Foreign Key linking to `users(id)`, not null)
* `operator_id`: UUID (Foreign Key linking to `users(id)`, nullable)
* `status`: VARCHAR (e.g. `Draft`, `Submitted`, `Assigned`, `UnderReview`, `Quoted`, `Completed`, `Cancelled`)
* `type`: VARCHAR (`Simple` or `Detailed`, not null)
* `project_id`: UUID (Foreign Key to `business_projects(id)`, nullable)
* `title`: VARCHAR (e.g., "Steel rebars for Astral Site")
* `description`: TEXT (Summary comments, nullable)
* `delivery_address`: TEXT (Address details, nullable)
* `delivery_timeline`: DATE (Target delivery timeline date, nullable)
* `created_at`: TIMESTAMP (with timezone, default `NOW()`)
* `updated_at`: TIMESTAMP (with timezone, default `NOW()`)

### B. Table: `rfq_items`
Stores the itemized product list requested by the buyer.
* `id`: UUID (PK)
* `rfq_id`: UUID (FK to `rfqs(id)` ON DELETE CASCADE, not null)
* `product_id`: UUID (FK to `products(id)`, nullable for custom user entries)
* `custom_product_name`: VARCHAR (Used if product does not exist in catalog, nullable)
* `quantity`: NUMERIC (Scale/precision validated, not null)
* `unit_of_measure`: VARCHAR (e.g. `Piece`, `Ton`, `Bag`, not null)
* `target_price`: NUMERIC (Expected pricing threshold, nullable)
* `created_at`: TIMESTAMP

### C. Table: `quotations`
Stores the operator-generated quotation drafts. Supports multiple versions for negotiations.
* `id`: UUID (PK)
* `rfq_id`: UUID (FK to `rfqs(id)` ON DELETE CASCADE, not null)
* `quote_number`: VARCHAR (e.g. `QT-1024`, unique key)
* `version`: INT (default `1`, incremented on revised quotation postings)
* `status`: VARCHAR (`Sent`, `NegotiationRequested`, `Approved`, `Declined`, `Expired`)
* `total_amount`: NUMERIC (Calculated sum, not null)
* `tax_amount`: NUMERIC (Tax totals)
* `shipping_fees`: NUMERIC (Logistics cost)
* `valid_until`: TIMESTAMP (Default `NOW() + INTERVAL '7 days'`)
* `created_by`: UUID (FK to `users(id)` representing the operator)
* `created_at`: TIMESTAMP

### D. Table: `quotation_items`
Holds the pricing offered by the operator for each itemized entry.
* `id`: UUID (PK)
* `quotation_id`: UUID (FK to `quotations(id)` ON DELETE CASCADE, not null)
* `rfq_item_id`: UUID (FK to `rfq_items(id)`, not null)
* `product_variant_id`: UUID (FK to `product_variants(id)` standard variant mapping)
* `offered_price`: NUMERIC (Unit price offered, not null)
* `tax_rate`: NUMERIC (Tax percent, e.g. `18.00` for GST)
* `lead_time_days`: INT (Estimated variant logistics shipping delay)
* `notes`: VARCHAR (Adjustment details)

### E. Table: `rfq_attachments`
Logs uploaded files (engineering drawings, tax registration details).
* `id`: UUID (PK)
* `rfq_id`: UUID (FK to `rfqs(id)`, not null)
* `file_name`: VARCHAR (not null)
* `file_url`: VARCHAR (not null)
* `file_size_bytes`: INT
* `mime_type`: VARCHAR
* `uploaded_by`: UUID (FK to `users(id)`)
* `uploaded_at`: TIMESTAMP

### F. Table: `rfq_comments`
Tracks collaboration chat entries.
* `id`: UUID (PK)
* `rfq_id`: UUID (FK to `rfqs(id)`, not null)
* `author_id`: UUID (FK to `users(id)`, not null)
* `content`: TEXT (Markdown text content, not null)
* `is_internal`: BOOLEAN (default `false`; if `true`, completely hidden from B2B customer portal)
* `created_at`: TIMESTAMP

### G. Table: `rfq_activity_logs`
Logs immutable state changes and modifications for compliance audit trails.
* `id`: UUID (PK)
* `rfq_id`: UUID (FK to `rfqs(id)`, not null)
* `actor_id`: UUID (FK to `users(id)`, not null)
* `action`: VARCHAR (e.g. `StatusChanged`, `QuotationRevised`, `CommentAdded`, `Assigned`)
* `old_value`: JSONB (Old states snapshot, nullable)
* `new_value`: JSONB (New states snapshot, nullable)
* `created_at`: TIMESTAMP (default `NOW()`)

---

## 3. Versioning Strategy
When a B2B Buyer clicks "Renegotiate" on an active quote:
1. The Quotation record is set to `NegotiationRequested`.
2. The Admin operator drafts a revised quotation:
   - Create a new row in `quotations` copying the previous parameters.
   - Set the `version` field value to `previous_version + 1` (e.g. V2).
   - Insert new records into `quotation_items` representing the revised offered prices.
   - Set the state of the V2 quotation to `Sent`.
3. This maintains a complete database audit trail of price shifts throughout the negotiation.
