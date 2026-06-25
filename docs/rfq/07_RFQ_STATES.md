# 07_RFQ_STATES — RFQ Lifecycle State Transitions

## Document Metadata
* **Title**: ARCUS RFQ State Machine Specification
* **Purpose**: Defines states, transition rules, forbidden paths, and automated state sweeps for the RFQ Workspace module.
* **Version**: v1.0
* **Status**: Proposed / Review Required
* **Last Updated**: 2026-06-26
* **Maintainer**: Principal Backend Engineer / Quality Assurance Engineer
* **Related Documents**:
  - [02_RFQ_WORKFLOWS.md](file:///d:/Claude%20Code/Arcus/docs/rfq/02_RFQ_WORKFLOWS.md)
  - [03_RFQ_DATA_MODEL.md](file:///d:/Claude%20Code/Arcus/docs/rfq/03_RFQ_DATA_MODEL.md)
* **Estimated Reading Time**: 8 minutes

---

## 1. State Machine Definitions

The Requests For Quote and Quotations lifecycles operate as dependent parallel state machines:

### RFQ States
* **`Draft`**: Requisition created by the B2B buyer but not yet posted.
* **`Submitted`**: Posted to the queue; awaiting back-office audit reviews.
* **`Assigned`**: Assigned to a procurement operator.
* **`UnderReview`**: Operator is reviewing product details and querying vendors.
* **`Quoted`**: Active quotation sent to the customer portal.
* **`Completed`**: Quote approved; converted to order. Final terminal state.
* **`Cancelled`**: Cancelled by operator or customer. Terminal state.

### Quotation States
* **`Sent`**: Active quote version delivered to customer portal. Awaiting response.
* **`NegotiationRequested`**: Customer submitted counter-offer. Awaiting revision.
* **`Approved`**: Approved by customer. Triggers RFQ `Completed`. Terminal state.
* **`Declined`**: Declined by customer. Triggers RFQ `Cancelled`. Terminal state.
* **`Expired`**: Validity period past. Triggers RFQ reset to `Assigned`/`Open`. Terminal state.

---

## 2. State Transition Matrix

The table below maps allowed target states from each source state:

| Source State | Target: Draft | Target: Submitted | Target: Assigned | Target: UnderReview | Target: Quoted | Target: Completed | Target: Cancelled |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`Draft`** | — | 🟢 **Allowed** | ❌ | ❌ | ❌ | ❌ | 🟢 **Allowed** |
| **`Submitted`**| ❌ | — | 🟢 **Allowed** | 🟢 **Allowed** | ❌ | ❌ | 🟢 **Allowed** |
| **`Assigned`** | ❌ | ❌ | — | 🟢 **Allowed** | 🟢 **Allowed** | ❌ | 🟢 **Allowed** |
| **`UnderReview`**| ❌ | ❌ | ❌ | — | 🟢 **Allowed** | ❌ | 🟢 **Allowed** |
| **`Quoted`** | ❌ | ❌ | ❌ | 🟢 **Allowed** (revise)| — | 🟢 **Allowed** (accept)| 🟢 **Allowed** |
| **`Completed`**| ❌ | ❌ | ❌ | ❌ | ❌ | — | ❌ |
| **`Cancelled`**| ❌ | ❌ | 🟢 **Allowed** (reopen)| ❌ | ❌ | ❌ | — |

---

## 3. Transition Rules & Constraints

### A. Automatic Transitions
* **Quote Acceptance $\rightarrow$ Order Conversion**: Setting a quotation to `Approved` automatically sets the parent RFQ status to `Completed` and invokes the `convertQuotationToOrder()` service.
* **Nightly Expiry Sweep**: A cron job checks validity dates daily. Quotations with `valid_until < NOW()` and status `Sent` are automatically set to `Expired`. The parent RFQ status resets from `Quoted` back to `Assigned`, alerting operators.

### B. Forbidden Transitions
* **Terminal Lock**: No transitions are allowed out of `Completed`. A completed RFQ is locked.
* **Review Gate**: An RFQ cannot transition from `Submitted` to `Quoted` without passing through `Assigned` or `UnderReview`.
* **No Direct B2C Operations**: B2C retail sessions cannot execute transitions on B2B-only states.
