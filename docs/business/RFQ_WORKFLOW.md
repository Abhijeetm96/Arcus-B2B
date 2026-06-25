# Chapter 13: Request For Quote (RFQ) Module

---
◀️ **[Previous](BUSINESS_RULES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](QUOTATION_WORKFLOW.md)** ▶️
---


The Request for Quote (RFQ) module digitizes B2B procurement, allowing builders to submit specs, review quotes, and convert approved quotes into active orders.

### RFQ & Quotation Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Submitted : User Posts RFQ
    Submitted --> Open : Admin Reviews & Approves
    Open --> UnderReview : Admin Simulates Supplier Bids
    UnderReview --> QuotesReceived : Supplier Quotes Drafted (SENT)
    
    state QuotesReceived {
        [*] --> DraftSent
        DraftSent --> NegotiationRequested : Customer Requests Renegotiation
        NegotiationRequested --> DraftSent : Admin Uploads New Version (V2+)
        DraftSent --> Declined : Customer Declines Quote
        DraftSent --> Approved : Customer Approves Quote
    }

    Approved --> Completed : Auto-Convert to Order (Order Status: Confirmed)
    Declined --> Cancelled : Close Pipeline
    Expired --> Cancelled : Quote Validity Period Ends
    Cancelled --> [*]
    Completed --> [*]
```

### RFQ Conversion Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Business Buyer
    participant Admin as Back-Office Admin
    participant RFQSvc as RFQ & Quotation Service
    participant OrdSvc as Order Service
    participant DB as Postgres Database

    Customer->>RFQSvc: POST /api/rfq (Submit specs & drawings)
    RFQSvc->>DB: Save RFQ (status = 'Submitted')
    Admin->>RFQSvc: POST /api/rfqs/:id/quotations (Draft quote details)
    alt New Quotation
        RFQSvc->>DB: Save Quotation (QT-101-V1, status = 'SENT')
        RFQSvc->>DB: Set RFQ status = 'Quoted'
    else Revise Existing Quote
        RFQSvc->>DB: Fetch latest version (V1)
        RFQSvc->>DB: Insert new version (QT-101-V2, status = 'SENT')
    end
    
    Customer->>RFQSvc: POST /api/quotations/:id/accept (Approve version)
    RFQSvc->>DB: Set Quotation status = 'APPROVED'
    RFQSvc->>OrdSvc: Trigger convertQuotationToOrder()
    
    Note over OrdSvc: 1. Fetch quote details<br/>2. Retrieve buyer profile (checks GST & company)<br/>3. Format order items (fallback custom ID)
    
    OrdSvc->>DB: Create Order (ARC-XXXXX, status = 'Confirmed')
    OrdSvc->>DB: Insert order_items list
    OrdSvc->>DB: Calculate & credit BuildPoints (1% or 2% for contractors)
    RFQSvc->>DB: Set RFQ status = 'Completed'
    OrdSvc-->>Customer: Return active order details
```

### Detailed RFQ Types
1. **Quick RFQ**: Submitted from the homepage widget. Requires name, phone, category, and delivery location.
2. **Inquiry RFQ**: Submitted from the Services Hub for trade quotes. Requires budget, timeline, and description.
3. **Detailed RFQ**: Submitted from the B2B portal. Requires line items, drawings uploads, and delivery details.

### Business Rules & Constraints
* **Versioning**: Quotations are versioned (e.g. `QT-101-V1`, `QT-101-V2`). Each renegotiation request increments the version, keeping previous versions in the database.
* **Conversion**: Approving a quotation automatically triggers `convertQuotationToOrder()`, creating an order with status `Confirmed` and payment method `B2B Credit`.
* **Lead Times**: Quote conversion calculates estimated delivery dates based on product variant lead times.

---

---

---

## 🧭 RFQ Visual Workflows & Sequence Diagrams



---
◀️ **[Previous](BUSINESS_RULES.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](QUOTATION_WORKFLOW.md)** ▶️
