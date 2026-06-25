# 05_RFQ_PERMISSIONS — RFQ Suite Role-Based Access Control (RBAC)

## Document Metadata
* **Title**: ARCUS RFQ Permissions & RBAC Matrix
* **Purpose**: Defines user roles, action-level permissions, and authorization constraints for the RFQ Workspace module.
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal Backend Architect / Security Auditor
* **Related Documents**:
  - [01_RFQ_WORKSPACE.md](file:///d:/Claude%20Code/Arcus/docs/rfq/01_RFQ_WORKSPACE.md)
  - [06_RFQ_API_PLAN.md](file:///d:/Claude%20Code/Arcus/docs/rfq/06_RFQ_API_PLAN.md)
* **Estimated Reading Time**: 8 minutes

---

## 1. Role Definitions

The platform enforces separation between retail users and B2B buyers/operations staff:
* **Guest**: Public anonymous visitors.
* **Individual**: B2C retail buyers. Completely restricted from B2B RFQ features.
* **Business**: Registered corporate B2B buyers (GST-verified). Can submit detailed RFQs and renegotiate quotes.
* **Professional**: B2B contractor clients. Same permissions as Business buyers.
* **Sales**: Back-office sales agents. Can draft and send quotations.
* **Procurement / Operations**: Core back-office operators managing supplier quotes. Can edit RFQ items and manage assignments.
* **Admin**: Back-office administrators. Full workspace management.
* **Super Admin**: Database and platform owners.

---

## 2. RBAC Permissions Matrix

The following matrix maps allowed actions per role:

| Action | Guest | Individual | Business / Professional | Sales | Procurement / Operations | Admin / Super Admin |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **View (Own)** | ❌ | ❌ | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** |
| **View (All)** | ❌ | ❌ | ❌ | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** |
| **Create (RFQ)** | ❌ | ❌ | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** (on behalf) |
| **Edit (Draft)** | ❌ | ❌ | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** |
| **Delete (Draft)**| ❌ | ❌ | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** |
| **Approve Quote** | ❌ | ❌ | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** |
| **Renegotiate** | ❌ | ❌ | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** |
| **Draft Quote** | ❌ | ❌ | ❌ | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** |
| **Send Quote** | ❌ | ❌ | ❌ | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** |
| **Assign Operator**| ❌ | ❌ | ❌ | ❌ | 🟢 **Allowed** (self) | 🟢 **Allowed** (any) |
| **Export CSV/PDF** | ❌ | ❌ | 🟢 **Allowed** (own) | 🟢 **Allowed** | 🟢 **Allowed** | 🟢 **Allowed** |
| **Archive RFQ** | ❌ | ❌ | ❌ | ❌ | ❌ | 🟢 **Allowed** |
| **Convert to Order**| ❌ | ❌ | 🟢 **Allowed** (auto) | ❌ | ❌ | 🟢 **Allowed** (force) |

---

## 3. Authorization Rules & Constraints

1. **Owner-Only Restraints**: Business buyers can only view, edit, or accept RFQs/Quotations where `buyer_id` matches their own `user_id`. Query filters must enforce `WHERE buyer_id = CURRENT_USER_ID` at the database query level to prevent access leaks.
2. **GST Validation Check**: B2B buyers can only submit detailed RFQs after completing GST verification. Submitting detailed RFQs from accounts without verified `gst_number` keys is blocked by server validation middleware.
3. **No B2C Access**: Individuals are completely blocked from viewing or creating RFQs. Any request from a user with the `Individual` role to `/api/rfqs` will immediately return `403 Forbidden`.
4. **Internal Comments Protection**: Only users with roles `Sales`, `Procurement`, `Operations`, `Admin`, or `Super Admin` can view or write comments marked `is_internal = true`. Customer sessions must never receive internal comments.
5. **Immutable Versioning**: No role can edit a quotation after its status is set to `Sent` or `Approved`. Changes require drafting a new quotation version, which is verified by status locks.
