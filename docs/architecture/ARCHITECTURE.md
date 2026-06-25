# Chapter 3: Onboarding & General Architecture

---
◀️ **[Previous](../PROJECT_BRAIN.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ADRS.md)** ▶️
---



## 3.1. Developer Onboarding Quickstart
Refer to [START_HERE.md](../START_HERE.md) for a concise <10 minute overview of platform files, rules, and stack.

## 3.2. General Architecture Details
The ARCUS platform uses a decoupled, full-stack monorepo web architecture. The front-end is a React 19 Single Page Application (SPA), while the back-end is a Node.js and Express REST API. 

```mermaid
graph TD
    subgraph Client ["Client-Side React SPA"]
        App["App.tsx Router"] --> PortalResolver["PortalResolver.tsx"]
        PortalResolver --> Portals["Portals (Admin / Business / Individual / Professional)"]
        App --> Contexts["Contexts (AuthContext · CartContext)"]
        App --> Views["Hubs (MaterialsHub · ServicesHub · SearchPage · ProductDetail · Checkout)"]
        CSS["index.css (HSL Design Tokens)"] -.- App
    end

    subgraph Validation ["Shared Layer"]
        Val["validation.ts (Isomorphic Validators & XSS/SQLi Guards)"]
    end

    subgraph Server ["Server-Side Node.js Express REST API"]
        Index["index.ts (App Router & Rate Limiters)"] --> Auth["Auth Middleware & Scope Guards"]
        Auth --> Services["Domain Service Layer"]
        subgraph Services
            CatalogSvc["Catalog Service"]
            InventorySvc["Inventory Service"]
            OrderSvc["Order Service"]
            RfqSvc["RFQ & Quotation Service"]
            SearchSvc["Search & Analytics Service"]
            UserSvc["User & Profile Service"]
            AuditSvc["Audit Logging Service"]
        end
        Services --> DBFacade["db.ts (Database Re-export Facade)"]
    end

    subgraph Database ["Data Persistence Layer"]
        DBFacade --> PGDB[("PostgreSQL DB (Production)")]
        DBFacade --> JSONDB[("db.json (Local Development Fallback)")]
    end

    Client -->|"HTTP API Requests (Bearer JWT)"| Index
    Val -.- Client
    Val -.- Server
```

## 3.3. Frontend Architecture Details
* **Routing**: Uses a hash-based router in `src/App.tsx` that listens to `window.location.hash` changes. Segment parsing automatically maps slugs into component props (e.g. `#/materials/{category}/{subcategory}/{leaf}`).
* **State Management**:
  * `AuthContext` (cross-ref: [Section 7](#7-authentication--permissions-flow)): Tracks user session token, parses user role, manages register/login OTP flows, and coordinates redirections via `PortalResolver`.
  * `CartContext` (cross-ref: [Section 10](#10-loyalty-system)): Manages in-memory shopping cart states (add, edit, delete, MOQ/multiple enforcement) and coupon validation rules.
* **Styling & UI**: Implemented via Vanilla CSS variables using HSL color space. Extended with Tailwind utility classes. Key components utilize glassmorphic card designs, pulsing status dots, and hover-triggered scale animations.

## 3.4. Backend Architecture Details
* **REST Routing**: Single Express server (`server/src/index.ts`) handling all endpoint paths.
* **Rate Limiting**: Integrated `RateLimiter` instances defending auth, register, OTP request, and profile edit routes (cross-ref: [Section 15](#15-security)).
* **Service-Oriented Design**: Each feature area is grouped into a module with its own models and service classes, keeping business operations separate from database implementations.
* **Database Facade**: `server/src/database/db.ts` exposes PostgreSQL pgPool if `DATABASE_URL` is found in environment variables, or automatically falls back to reading and writing `server/data/db.json` locally.

---

## 3.5. End-to-End Data Flow Diagrams
The execution paths for key platform workflows are documented in the sequence diagrams below:
This section documents the execution paths for key platform workflows.

### 1. User Authentication (Login & Verification)
```mermaid
sequenceDiagram
    participant Client as React SPA (AuthPage)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Client->>Server: POST /api/auth/login {email, password}
    Server->>Server: Run Rate Limiter Check (loginLimiter)
    Server->>Server: Sanitize input (sanitizeText)
    Server->>DB: Fetch user record by email
    alt User Found & Hash Matches
        Server->>Server: Generate JWT token (expires in 24h)
        Server-->>Client: 200 OK {success: true, token, user}
        Client->>Client: Save JWT in localStorage
        Client->>Client: Redirect via PortalResolver
    else Invalid Credentials
        Server-->>Client: 400 Bad Request {error: 'Invalid credentials'}
    end
```

### 2. User Registration & OTP Verification
```mermaid
sequenceDiagram
    participant Client as React SPA (AuthPage)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Client->>Server: POST /api/auth/register {name, email, phone, role, password, ...}
    Server->>Server: Validate input fields format
    Server->>DB: Check if email/phone exists
    alt Email/Phone Unique
        Server->>DB: Save user (is_verified = false, is_active = false)
        Server->>Server: Generate 6-digit OTP code
        Server->>DB: Save OTP record (expires in 5m)
        Server-->>Client: 201 Created {success: true, email}
        Note over Client: Open OTP Verification Panel
        Client->>Server: POST /api/auth/verify-email-otp {email, otp}
        Server->>DB: Fetch and validate active OTP
        alt OTP Matches & Valid
            Server->>DB: Update user (is_active = true, email_verified = true)
            Server->>DB: Delete OTP record
            Server->>Server: Generate JWT token
            Server-->>Client: 200 OK {success: true, token, user}
        else Invalid OTP
            Server-->>Client: 400 Bad Request {error: 'Invalid OTP'}
        end
    else Duplicate User
        Server-->>Client: 400 Bad Request {error: 'Email already registered'}
    end
```

### 3. Materials Purchase Checkout
```mermaid
sequenceDiagram
    participant Client as React SPA (Checkout)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Client->>Server: POST /api/orders {userId, cartItems, shippingAddress, billingAddress, couponCode, paymentMethod}
    Server->>Server: Sanitize Address & Payment Strings
    Server->>DB: Begin Database Transaction
    Server->>DB: Check stock availability for all items
    alt Stock Available
        Server->>DB: Reserve Stock (available - qty, reserved + qty)
        Server->>Server: Calculate pricing, tax (GST 18%), and coupon discounts
        Server->>DB: Insert Order Header
        Server->>DB: Insert Order Items lines
        Server->>DB: Deduplicate and save Shipping/Billing addresses to user_addresses
        Server->>DB: Record BuildPoints delta in ledger
        Server->>DB: Update user wallet balance & lifetime points
        Server->>DB: Commit Database Transaction
        Server-->>Client: 200 OK {success: true, order}
        Client->>Client: Clear cart state
        Client->>Client: Redirect to #/checkout/success
    else Insufficient Stock
        Server->>DB: Rollback Database Transaction
        Server-->>Client: 400 Bad Request {error: 'Insufficient stock'}
    end
```

### 4. RFQ Submission
```mermaid
sequenceDiagram
    participant Client as React SPA (RfqForm)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Client->>Server: POST /api/rfq {buyerId, title, category, quantity, location, budget, details, attachments}
    Server->>Server: Sanitize fields
    Server->>DB: Insert RFQ Header record (status = 'Submitted')
    Server->>DB: Insert RFQ Items specifications list
    Server-->>Client: 200 OK {success: true, rfq}
    Client->>Client: Redirect to B2B RFQ Dashboard
```

### 5. Quotation Negotiation & Versioning
```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant Client as B2B Portal
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Admin->>Server: POST /api/rfqs/:id/quotations {quoteData, items}
    Server->>DB: Check for existing quotation_number for RFQ
    alt First Quote Draft
        Server->>Server: Set version = 1, generate quotation_number (QT-101)
    else Revision Draft
        Server->>Server: Increment version (V2, V3)
    end
    Server->>DB: Insert Quotation (status = 'SENT')
    Server->>DB: Insert Quotation Items lines
    Server->>DB: Update RFQ status = 'Quoted'
    Server-->>Admin: 200 OK {quotation}
    
    Client->>Server: POST /api/quotations/:id/renegotiate {customerComments}
    Server->>DB: Update active Quotation status = 'NEGOTIATION_REQUESTED'
    Server->>DB: Set RFQ status = 'Quotes Received'
    Server-->>Client: 200 OK {success: true}
```

### 6. Search Engine Query & Click Telemetry
```mermaid
sequenceDiagram
    participant Client as React SPA (Navbar / SearchPage)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Client->>Server: GET /api/search?q=cement
    Server->>DB: Execute ILIKE search on Products, Categories, Brands
    Server->>DB: Log search query & results count to search_queries
    Server-->>Client: 200 OK {products, categories, brands, services, professionals}
    
    Client->>Server: POST /api/search/click {productId, query}
    Server->>DB: Log click event to search_clicks
    Server-->>Client: 200 OK {success: true}
```

### 7. Product Catalog Bulk Import
```mermaid
sequenceDiagram
    participant Admin as Admin Portal (ImportProducts)
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)

    Admin->>Server: POST /api/admin/catalog/import/upload {file}
    Server->>Server: Run file validation (XLSX check structure)
    Server-->>Admin: 200 OK {validatedRows, previewData}
    
    Admin->>Server: POST /api/admin/catalog/import/confirm {rows}
    Server->>DB: Begin Database Transaction
    loop For Each Product
        Server->>DB: Upsert Product category & details
        Server->>DB: Upsert Variant details (SKU, price)
        Server->>DB: Initialize Inventory record (stock)
    end
    Server->>DB: Log import history to import_history
    Server->>DB: Commit Database Transaction
    Server-->>Admin: 200 OK {success: true, addedCount, updatedCount}
```

### 8. Order Fulfillment & Status Flow
```mermaid
stateDiagram-v2
    [*] --> Pending : Checkout Placement
    Pending --> Confirmed : Auto/Admin Approval
    Confirmed --> Processing : Procurement Started
    Processing --> Shipped : Cargo Dispatched
    Shipped --> Delivered : Received by Buyer
    Pending --> Cancelled : Buyer/Admin Cancel
    Confirmed --> Cancelled : Stock Released & Wallet Refunded
```

### 9. Inventory Reservation & Safety Stock Alerts
```mermaid
sequenceDiagram
    participant OrderSvc as Order Service
    participant InvSvc as Inventory Service
    participant DB as Database (Postgres / JSON)
    participant Admin as Admin Dashboard
    
    OrderSvc->>InvSvc: reserveStock(variantId, quantity)
    InvSvc->>DB: SELECT available_stock, reserved_stock, reorder_level FROM inventory WHERE variant_id = variantId
    alt stock >= quantity
        InvSvc->>DB: UPDATE inventory SET available_stock = available_stock - qty, reserved_stock = reserved_stock + qty WHERE variant_id = variantId
        InvSvc-->>OrderSvc: {success: true}
        alt available_stock < reorder_level
            InvSvc->>Admin: Trigger Low Stock Notification / Alert
        end
    else stock < quantity
        InvSvc-->>OrderSvc: {success: false, error: 'Insufficient stock'}
    end
```

### 10. BuildPoints Double-Entry Wallet Ledger Flow
```mermaid
sequenceDiagram
    participant OrderSvc as Order Service
    participant Ledger as BuildPoints Ledger
    participant Wallet as BuildPoints Wallet
    participant DB as Database (Postgres / JSON)
    
    OrderSvc->>Ledger: recordTransaction(userId, points, type, referenceId)
    Ledger->>DB: INSERT INTO buildpoints_ledger (wallet_user_id, points, transaction_type, order_id)
    Ledger->>Wallet: updateWalletBalance(userId)
    Wallet->>DB: SELECT SUM(points) FROM buildpoints_ledger WHERE wallet_user_id = userId
    Wallet->>DB: UPDATE buildpoints_wallets SET balance = sum, updated_at = NOW() WHERE user_id = userId
    Wallet-->>OrderSvc: {success: true, newBalance}
```

### 11. Product Catalog Export Flow
```mermaid
sequenceDiagram
    participant Admin as Admin Portal
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)
    
    Admin->>Server: GET /api/admin/catalog/export (token)
    Server->>Server: Validate authorization (isAdmin)
    Server->>DB: SELECT products, variants, price tiers
    Server->>Server: Convert records to CSV format string
    Server-->>Admin: 200 OK (Stream CSV file attachment)
```

### 12. Catalog Manual Updates & Cache Invalidation Flow
```mermaid
sequenceDiagram
    participant Admin as Admin Panel
    participant Server as Express Server
    participant DB as Database (Postgres / JSON)
    participant Cache as Search Cache
    
    Admin->>Server: PUT /api/admin/products/:id {updatedData}
    Server->>Server: Sanitize & validate fields
    Server->>DB: UPDATE products & product_variants WHERE id = productId
    Server->>Cache: Invalidate cache for product search query
    Server->>DB: Log audit trail event (type: 'UPDATE_PRODUCT')
    Server-->>Admin: 200 OK {success: true, product}
```

---

## 3.6. Module Dependency Graph
The ARCUS system modules are designed with clear boundaries. Below is the dependency map for each module, illustrating database tables, shared files, and side effects.
The ARCUS system modules are designed with clear boundaries. Below is the dependency map for each module, illustrating databases tables, shared files, and side effects.

```mermaid
graph LR
    Auth["Auth / Users"] --> Catalog["Catalog"]
    Catalog --> Inventory["Inventory"]
    RFQ["RFQ"] --> Orders["Orders"]
    Inventory --> Orders
    Auth --> Loyalty["Loyalty / BuildPoints"]
    Orders --> Loyalty
    Auth -.-> RFQ
    Catalog -.-> RFQ
    Catalog -.-> Orders
    Auth -.-> Orders
```

### 1. Authentication & Users Module
* **Depends On**: None.
* **Used By**: Orders, RFQ, Loyalty, Admin, Checkout.
* **Database Tables**: `users`, `otps`, `individual_profiles`, `business_profiles`, `professional_profiles`, `admin_profiles`.
* **Primary APIs**:
  * `POST /api/auth/register` (cross-ref: [Section 6](#6-api-documentation))
  * `POST /api/auth/login` (cross-ref: [Section 6](#6-api-documentation))
  * `GET /api/auth/me` (cross-ref: [Section 6](#6-api-documentation))
* **Shared Components**: `AuthPage.tsx`
* **Side Effects**: Generates JWT session token; updates user profile status.
* **Cross-module interactions**: Links user IDs to wallets on signup; verifies GSTIN for B2B accounts.

### 2. Catalog Module
* **Depends On**: Categories, Brands.
* **Used By**: Search, Orders, RFQ, Inventory.
* **Database Tables**: `products`, `product_variants`, `product_price_tiers`, `categories`, `brands`, `product_images`, `product_accessories`, `product_reviews`.
* **Primary APIs**:
  * `GET /api/products` (cross-ref: [Section 6](#6-api-documentation))
  * `GET /api/products/:id` (cross-ref: [Section 6](#6-api-documentation))
* **Shared Components**: `MaterialsHub.tsx`, `ProductDetail.tsx`.
* **Side Effects**: None.
* **Cross-module interactions**: Supplies SKU identifiers and volume pricing parameters to checkout services.

### 3. Inventory Module
* **Depends On**: Catalog.
* **Used By**: Orders, Catalog.
* **Database Tables**: `inventory`, `inventory_adjustments`.
* **Primary APIs**:
  * `PUT /api/admin/inventory/:id` (cross-ref: [Section 6](#6-api-documentation))
* **Shared Components**: `InventoryManagement.tsx`
* **Side Effects**: Manual adjustments trigger low-stock alerts.
* **Cross-module interactions**: Restricts checkout orders if quantities exceed available stock levels.

### 4. Orders Module
* **Depends On**: Catalog, Inventory, Users, Loyalty.
* **Used By**: Checkout, Admin.
* **Database Tables**: `orders`, `order_items`, `user_addresses`.
* **Primary APIs**:
  * `POST /api/orders` (cross-ref: [Section 6](#6-api-documentation))
  * `GET /api/orders` (cross-ref: [Section 6](#6-api-documentation))
* **Shared Components**: `Checkout.tsx`, `IndividualOrders.tsx`.
* **Side Effects**: Deduplicates address records, reserves stock, awards BuildPoints.
* **Cross-module interactions**: Order status updates (e.g. Cancelled) release reserved inventory.

### 5. RFQ Module
* **Depends On**: Users, Catalog, Orders.
* **Used By**: Business, Admin.
* **Database Tables**: `rfqs`, `rfq_items`, `quotations`, `quotation_items`.
* **Primary APIs**:
  * `POST /api/rfq` (cross-ref: [Section 6](#6-api-documentation))
  * `POST /api/rfqs/:id/quotations` (cross-ref: [Section 6](#6-api-documentation))
  * `POST /api/quotations/:id/accept` (cross-ref: [Section 6](#6-api-documentation))
* **Shared Components**: `RfqForm.tsx`, `RFQManagement.tsx`.
* **Side Effects**: Auto-converts quotation to order, marks RFQ as completed, updates inventory stock levels.
* **Cross-module interactions**: Accept quotes calls `convertQuotationToOrder` in the Orders Service.

### 6. Loyalty Module
* **Depends On**: Users, Orders.
* **Used By**: Orders, Checkout.
* **Database Tables**: `buildpoints_wallets`, `buildpoints_ledger`.
* **Primary APIs**: None.
* **Shared Components**: `Navbar.tsx`, `Checkout.tsx`.
* **Side Effects**: Wallet updates verify wallet balance equals the sum of ledger points.
* **Cross-module interactions**: Accrues points on orders.

---

## 3.7. Event Lifecycle Documentation
Below are the downstream processes triggered by system events.
Below are the downstream processes triggered by system events.

### 1. Event: `Order Created`
```mermaid
graph TD
    OrderCreated[Order Checkout Successful] --> ReserveInv[Reserve Inventory (available_stock - qty, reserved_stock + qty)]
    ReserveInv --> GenLedger[Generate Ledger Entry (buildpoints_ledger - credit points delta)]
    GenLedger --> AwardBP[Award BuildPoints (buildpoints_wallets - update balance)]
    AwardBP --> GenInvoice[Generate Tax Invoice (SGST 9%, CGST 9%)]
    GenInvoice --> SendEmail[Send Confirmation Email (SMTP via Nodemailer)]
    SendEmail --> WriteAudit[Write Audit Log (action: 'CREATE_ORDER')]
    WriteAudit --> RefreshDashboard[Refresh Dashboards (Admin orders grid & User portal update)]
```

### 2. Event: `Registration Completed`
```mermaid
graph TD
    RegSubmit[Registration Form Submitted] --> CreateUnverified[Create unverified User Record (is_active = false)]
    CreateUnverified --> InitWallet[Initialize Loyalty Wallet (set balance = 0)]
    InitWallet --> GenOTP[Generate 6-digit verification code]
    GenOTP --> SendMockSMS[Log code in Console / Send Mock SMS]
    SendMockSMS --> OpenPopup[Open OTP Verification Popup on Frontend]
```

### 3. Event: `RFQ Submitted`
```mermaid
graph TD
    RfqSubmit[User Submits RFQ Specs] --> CreateRfqHeader[Create RFQ Header record (status = 'Submitted')]
    CreateRfqHeader --> WriteItems[Write RFQ spec lines to rfq_items]
    WriteItems --> AdminNotify[Trigger Back-office Admin Notification (Alert details)]
    AdminNotify --> WriteAudit[Write Audit Log (action: 'SUBMIT_RFQ')]
```

### 4. Event: `Quotation Approved`
```mermaid
graph TD
    QuoteApprove[User Accepts Quote QT-101-V2] --> SetQuoteApproved[Set Quotation status = 'APPROVED']
    SetQuoteApproved --> ConvertToOrder[Trigger convertQuotationToOrder()]
    ConvertToOrder --> RetrieveProfile[Retrieve B2B buyer profile (checks GST & company)]
    RetrieveProfile --> FormatItems[Format order items & assign variant parameters]
    FormatItems --> CreateOrder[Create active Order (status = 'Confirmed')]
    CreateOrder --> AccrueBP[Accrue BuildPoints (double points for Contractors)]
    AccrueBP --> SetRfqCompleted[Set RFQ status = 'Completed']
```

### 5. Event: `Inventory Adjustment`
```mermaid
graph TD
    InvAdjust[Admin Manually Adjusts SKU Stock] --> UpdateStock[Update available_stock in inventory table]
    UpdateStock --> WriteTrail[Write detailed record to inventory_adjustments (type, reason)]
    WriteTrail --> WriteAudit[Write Audit Log (action: 'ADJUST_STOCK')]
    WriteAudit --> CheckThreshold{available_stock < reorder_level?}
    CheckThreshold -- Yes --> TriggerAlert[Trigger Low Stock Alert / Notification]
    CheckThreshold -- No --> End[End]
```

### 6. Event: `User Verification`
```mermaid
graph TD
    VerifyUser[OTP Verification Request received] --> ValidateOTP[Validate active OTP code matches]
    ValidateOTP --> SetUserActive[Update user: is_active = true, email_verified = true]
    SetUserActive --> DeleteOTP[Delete OTP record]
    DeleteOTP --> GenJWT[Generate JWT session token]
    GenJWT --> LoginUser[Log user in and route via PortalResolver]
```

### 7. Event: `Admin Approval`
```mermaid
graph TD
    AdminApprove[Admin Action: Approve Registration / Quotation] --> VerifyScope[Verify Admin Role & Permissions Scope]
    VerifyScope --> UpdateStatus[Update Target status to APPROVED/ACTIVE]
    UpdateStatus --> WriteAudit[Write Audit Log (action: 'ADMIN_APPROVED')]
    WriteAudit --> NotifyTarget[Notify corresponding User / Supplier via Email/System Alert]
```

---

---

---

# Chapter 5: Engineering Principles
The following core principles govern all modifications to the ARCUS platform:

1. **Normalized Database First**: Maintain a normalized schema. Never store duplicate profile details, addresses, or variants.
2. **Backend is the Source of Truth**: All calculations (prices, tax calculations, BuildPoints accrual, discount verification) must occur on the backend. Frontend components only display state.
3. **Double-Entry Ledger Integrity**: Never modify wallet point balances without a corresponding record in `buildpoints_ledger`.
4. **Traceable Inventory Movements**: Every inventory adjustment must write a record to `inventory_adjustments` detailing the admin, adjustment type, and reason.
5. **Decoupled Business Logic**: Keep route handlers thin. All business logic must reside within service classes (`ProductService`, `OrderService`).
6. **Backward Compatibility**: Never break existing API contracts or JSON shapes. If a column is deprecated, map it to the new normalized tables to preserve compatibility.
7. **JSON Parity**: Fallback JSON database methods must return data structured identically to the PostgreSQL database queries.
8. **Centralized Input Sanitization**: Clean all text parameters against XSS and SQL injection patterns at the entry point of the API.
9. **Idempotent Migrations**: Database migration scripts must run safely multiple times without causing errors (using `IF NOT EXISTS` or schema check guards).

---

---

---

# Chapter 7: Technology Stack & Dependency Matrix
| Domain | Technology / Library | Version | Purpose / Description |
| :--- | :--- | :--- | :--- |
| **Frontend Core** | React | `^19.2.6` | Component-based client SPA framework |
| **Frontend DOM** | React-DOM | `^19.2.6` | Rendering layer for browser DOM |
| **Build Tooling** | Vite | `^8.0.12` | Frontend build pipeline & dev server |
| **Language** | TypeScript | `~6.0.2` (Client) / `^5.5.3` (Server) | Strong static typing compilation |
| **Styling Core** | Tailwind CSS | `^3.4.19` | Utility-first CSS layout styling |
| **CSS Pipeline** | PostCSS / Autoprefixer | `^8.5.15` / `^10.5.0` | Autoprefixing & tailwind compilation |
| **Linting Tools** | ESLint | `^10.3.0` | Static code analysis & standard enforcements |
| **Agent Support** | Agentation | `^3.0.2` | System tool for LLM agent interaction |
| **Backend Core** | Express | `^4.19.2` | REST API framework for Node.js |
| **Dev Daemon** | Nodemon | `^3.1.4` | Server dev auto-restart utility |
| **TypeScript Node** | ts-node | `^10.9.2` | Directly run TypeScript files in Node |
| **CORS Middleware** | cors | `^2.8.5` | Cross-Origin Resource Sharing handling |
| **Env Controller** | dotenv | `^16.4.5` | Environment variables load from `.env` |
| **Database Driver** | pg | `^8.21.0` | PostgreSQL client driver pool manager |
| **Database Types** | @types/pg | `^8.20.0` | TypeScript definitions for Postgres client |
| **Mail Dispatch** | Nodemailer | `^9.0.1` | SMTP email dispatch for OTP codes |
| **File Uploads** | Multer | `^2.2.0` | Multipart/form-data upload controller |
| **Spreadsheets** | xlsx | `^0.18.5` | Parsing and generation of CSV/Excel sheets |
| **Zipping Utility** | adm-zip | `^0.5.17` | Decompressing zip archives (zip-based catalogs) |

---

---

---
◀️ **[Previous](../PROJECT_BRAIN.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ADRS.md)** ▶️
