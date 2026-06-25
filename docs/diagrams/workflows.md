# Business Workflow Flowcharts

---
◀️ **[Previous](architecture.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](sequence.md)** ▶️
---



This page documents the user journey flowcharts for standard retail/commercial flows.

### 1. Customer Registration Flow
```mermaid
graph TD
    UserRegister[Submit Register Form] --> CheckExist{Email/Phone Exist?}
    CheckExist -- Yes --> ErrBad[Return 400 Bad Request]
    CheckExist -- No --> CreateRecord[Save Inactive User Record]
    CreateRecord --> GenOTP[Generate 6-digit OTP]
    GenOTP --> SendSMS[Log OTP / Send Mock SMS]
    SendSMS --> WaitOTP[Wait for OTP Verification]
    WaitOTP --> SubmitOTP[Submit OTP Code]
    SubmitOTP --> CheckOTP{OTP Matches & Valid?}
    CheckOTP -- No --> ErrOTP[Return 400 Invalid OTP]
    CheckOTP -- Yes --> SetActive[Set is_active = true]
    SetActive --> GenToken[Generate JWT Token]
    GenToken --> Finalize[Route User via PortalResolver]
```

### 2. Product Purchase & Cart Validation Flow
```mermaid
sequenceDiagram
    participant Client as React SPA (Cart)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)
    
    Client->>Server: POST /api/cart/validate {items}
    Server->>DB: Check MOQ and Stock for each Variant
    alt MOQ / Multiple Violation
        Server-->>Client: 400 Bad Request {error: 'MOQ not met'}
    else Stock Available
        Server-->>Client: 200 OK {valid: true, pricing}
    else Out of Stock
        Server-->>Client: 400 Bad Request {error: 'Insufficient stock'}
    end
```

### 3. Order Checkout Flow
```mermaid
sequenceDiagram
    participant Client as React SPA
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)
    
    Client->>Server: POST /api/orders {cart, address, payment}
    Server->>DB: Begin Database Transaction
    Server->>DB: Lock available stock levels
    Server->>DB: Insert Order Header & Order Items
    Server->>DB: Deduplicate & save address records
    Server->>DB: Record BuildPoints delta in ledger
    Server->>DB: Update user wallet balance
    Server->>DB: Commit Database Transaction
    Server-->>Client: 200 OK {success: true, orderId}
```



For more workflows, see [RFQ_WORKFLOW.md](../business/RFQ_WORKFLOW.md).

---
◀️ **[Previous](architecture.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](sequence.md)** ▶️
