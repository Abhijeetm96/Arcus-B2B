# Chapter 15: Procurement Module

---
◀️ **[Previous](BUILDPOINTS.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../development/AI_GUIDELINES.md)** ▶️
---


The procurement module manages order lifecycles, project logs, invoicing, and fulfillment.

### Order Fulfillment Pipeline
Orders progress through the following statuses:

$$\text{Pending} \xrightarrow{\text{Payment/Approval}} \text{Confirmed} \xrightarrow{\text{Warehouse Pack}} \text{Dispatched} \xrightarrow{\text{Last Mile}} \text{Out For Delivery} \xrightarrow{\text{Sign-off}} \text{Delivered}$$

* **Cancelling Orders**: Users can cancel orders if the status is `Pending` or `Confirmed`. Cancelling triggers `releaseStock()`, returning reserved items to available inventory.

### Normalized Address Management
Flat address strings in order records are parsed into structured addresses in the `user_addresses` table during checkout.
* **Address Deduplication**: The checkout engine checks shipping/billing inputs against existing addresses for that user. If a match is found, it uses the existing address ID; otherwise, it inserts a new record.

### B2B Project Logs
Allows business buyers to group orders, RFQs, and invoices by construction project (e.g. "Residential Project - Phase 1").
* **Invoice Generation**: Invoices are generated as PDFs or spreadsheets, calculating taxable value, SGST (9%), CGST (9%), and total amount.

---

---

---
◀️ **[Previous](BUILDPOINTS.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../development/AI_GUIDELINES.md)** ▶️
