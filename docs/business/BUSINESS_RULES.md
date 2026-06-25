# Chapter 19: Permanent Business Rules & Workflows

---
◀️ **[Previous](../architecture/MODULES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](RFQ_WORKFLOW.md)** ▶️
---


* **B2B Negotiation**: Quotation negotiation is restricted to verified B2B accounts (cross-ref: [Section 9](#9-rfq-module)).
* **Wallet-Ledger Match**: Points wallet balances must equal the sum of ledger points (`balance = SUM(points)`) (cross-ref: [Section 10](#10-loyalty-system)).
* **Inventory Balance**: Available stock must never drop below zero.
* **Audit Trails**: Inventory adjustments require logged explanations (cross-ref: [Section 12](#12-admin-dashboard)).
* **Minimum Order Quantities**: MOQs are enforced at checkout (e.g. Cement requires a minimum of 50 bags).

---

## 17.5. Critical System Invariants ("DO NOT BREAK")

Architectural rules that must never be violated by developers or AI systems:

1. **Never Rename API Response Properties**: Frontend components depend on exact payload keys (e.g. `priceTiers`, `gstRate`, `pointsEarned`, `allowB2B`). Changing these causes runtime errors.
2. **Never Bypass BuildPoints Ledger**: Always write an entry in `buildpoints_ledger` when modifying `buildpoints_wallets.balance`.
3. **Never Modify Order IDs**: Converted RFQ quote orders and checkout orders must maintain their uniquely generated IDs (`ARC-XXXXX`) without alterations.
4. **Never Bypass Audit Logs**: All administrative operations (product CRUD, category tree updates, inventory adjustments, settings updates) must write to `audit_logs`.
5. **Never Duplicate Addresses**: Check for existing shipping/billing profiles in `user_addresses` before saving new address IDs.
6. **Never Calculate Pricing on Frontend**: All calculations for subtotal, tax amounts, applied discount values, and checkout grand totals must be requested from the backend.
7. **Never Update Inventory Without Transactions**: All stock reservations and releases must run inside SQL transaction blocks (`BEGIN` / `COMMIT` / `ROLLBACK`).
8. **Never Create RFQs Without Status History**: RFQ entries must be initialized with status `'Submitted'`.
9. **Never Bypass Role Permissions**: Middleware checks (`checkIsAdmin`, `adminAuthMiddleware`) must wrap all administrative route registrations.
10. **Never Remove Backward Compatibility**: Fallback parsing mappers in `OrderService` and `ProductService` must support legacy flat column shapes to preserve interface stability.
11. **Never Hardcode GST**: Default tax values must read from application settings configuration, falling back to 18% if not found.
12. **Never Remove JSON Fallback Support**: Ensure parity between relational database queries and JSON read/write fallbacks in all service modules.

---

## 17.6. Business Workflow Documentation

Detailed execution rules for core marketplace workflows.

### 1. B2C Purchase Workflow
* **Actors**: B2C Customer, Gateway, Logistics Provider.
* **Trigger**: Checkout button click in Cart.
* **Workflow**:
  1. Customer enters delivery address & coupon code (`WELCOME5` eligibility check).
  2. Cart validates MOQ and packaging multiples constraints.
  3. Server verifies stock availability in inventory.
  4. Server calculates price, applies discount, and adds 18% GST.
  5. User submits payment details (simulated checkout).
  6. Server reserves stock, generates order, and logs BuildPoints (1% return).
* **Business Rules**: B2C buyers are not eligible for quotation negotiations or Net-30 credit terms.
* **Exceptions**: If stock checks fail, order creation is aborted and user is prompted to adjust quantities.
* **Failure States**: Card payment failed, address format invalid.
* **Completion Conditions**: Order status set to `'Confirmed'`, points ledger credited, stock reserved.

### 2. B2B RFQ Workflow
* **Actors**: B2B Customer, Platform Administrator.
* **Trigger**: RFQ submitted via RfqForm.
* **Workflow**:
  1. B2B customer specifies title, category, quantity, location, and timeline.
  2. Customer uploads project drawings (optional).
  3. Admin reviews RFQ and simulates bids.
  4. Admin creates quotation version V1.
  5. B2B buyer reviews, renegotiates, or approves.
* **Business Rules**: Restricted to validated B2B accounts with active GST numbers.
* **Exceptions**: Non-verified B2B users are blocked from submission.
* **Failure States**: No specs entered, verification pending.
* **Completion Conditions**: RFQ status updated to `'Completed'` (upon quote acceptance).

### 3. Professional Booking Workflow
* **Actors**: B2C Customer, Trade Contractor.
* **Trigger**: "Book a Visit" click on professional profile.
* **Workflow**:
  1. Customer selects trade category and clicks profile.
  2. Customer enters name, phone, date, time, and address.
  3. Visit schedule details saved in backend database.
* **Business Rules**: Visites must be scheduled at least 24 hours in advance.
* **Failure States**: Contractor unavailable.
* **Completion Conditions**: Record inserted in `bookings` table.

### 4. Contractor Quotes Workflow
* **Actors**: B2C Customer, Trade Contractor.
* **Trigger**: "Request Quote" click on professional profile.
* **Workflow**:
  1. Customer enters name, phone, budget, timeline, and description.
  2. Request details saved in quotes table.
* **Business Rules**: Quotation request budget must be a positive number.
* **Completion Conditions**: Record inserted in `quotes` table.

### 5. Returns Workflow
* **Actors**: Customer, Platform Admin, Warehouse Staff.
* **Trigger**: Return request logged on Delivered order.
* **Workflow**:
  1. Admin audits return eligibility (within 7 days of delivery).
  2. Warehouse staff inspects material state.
  3. Admin approves return and issues refund.
  4. Inventory levels adjusted (available_stock incremented).
* **Business Rules**: Cement and open materials are non-returnable.
* **Completion Conditions**: Order status set to `'Returned'`, audit logs written.

### 6. Order Fulfillment Workflow
* **Actors**: Warehouse Staff, Courier, Customer.
* **Trigger**: Order set to `'Confirmed'`.
* **Workflow**:
  1. Warehouse staff packs items (`order_items` listing).
  2. Order status updated to `'Dispatched'`.
  3. Courier updates status to `'Out For Delivery'`.
  4. Customer signs delivery receipt.
  5. Status updated to `'Delivered'`.
* **Business Rules**: Delivery updates write status change logs automatically.
* **Completion Conditions**: Status set to `'Delivered'`, transaction complete.

### 7. Inventory Replenishment Workflow
* **Actors**: Inventory Manager, Supplier.
* **Trigger**: Available stock drops below reorder level.
* **Workflow**:
  1. System flags SKU low-stock alert.
  2. Inventory manager reviews and approves restocking order.
  3. Supplier delivers stock to warehouse.
  4. Inventory manager manually adjusts available stock level.
* **Business Rules**: Manual adjustments require documented reasons.
* **Completion Conditions**: Inventory updated, adjustment logs written.

### 8. Loyalty Wallet Workflow
* **Actors**: Customer, System Scheduler.
* **Trigger**: Checkout confirmed.
* **Workflow**:
  1. Order confirms.
  2. System calculates points (1% B2C, 0.5% B2B, 2% Contractor).
  3. Wallet ledger inserts transactional credit.
  4. Wallet balance updated.
* **Business Rules**: Points expire after 365 days.
* **Completion Conditions**: Wallet balance matches sum of ledger points.

---

---

---
◀️ **[Previous](../architecture/MODULES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](RFQ_WORKFLOW.md)** ▶️
