# Chapter 8: Folder Structure & Directory Map

---
◀️ **[Previous](DATABASE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../business/BUSINESS_RULES.md)** ▶️
---


```text
ARCUS/
├── .claude/                           # IDE settings & configurations
├── .git/                              # Git directory
├── .gitignore                         # Build & environment file exclusion rules
├── eslint.config.js                   # Client code quality rules
├── index.html                         # SPA index entry point
├── package.json                       # Client dependency map
├── postcss.config.js                  # CSS postprocessor configuration
├── tailwind.config.js                 # Theme styling rules & custom tokens
├── tsconfig.json / tsconfig.app.json  # TypeScript path mappings & rules
├── vite.config.ts                     # Dev server proxies & routing rules
│
├── design/                            # Static mockup designs (HTML/CSS)
│   ├── homepage.html                  # Mockup homepage layout
│   └── pdp.html                       # Mockup Product Detail Page layout
│
├── docs/                              # Technical specifications files
│   ├── api-specification.md           # API routes details
│   ├── architecture.md                # System structure specifications
│   ├── database-schema.md             # DB models mapping
│   ├── design-system.md               # CSS styling specifications
│   ├── loyalty-program.md             # Loyalty rules & coupons
│   ├── roadmap.md                     # Milestones schedule
│   ├── security.md                    # Data protection guidelines
│   └── validation-rules.md            # Input validation specifications
│
├── shared/                            # Isomorphic libraries shared by client/server
│   └── validation.ts                  # Input validators, regex filters, RateLimiter
│
├── src/                               # Frontend codebase (React 19)
│   ├── App.tsx                        # Main client router & global hooks
│   ├── index.css                      # HSL variables, utility classes, and base reset
│   ├── main.tsx                       # Client mounting entry point
│   │
│   ├── core/                          # Shared frontend logic
│   │   ├── auth/
│   │   │   └── PortalResolver.tsx     # Role-based dashboard redirect controller
│   │   ├── config/
│   │   │   └── format.ts              # Currency, date, and weight display formatters
│   │   ├── hooks/
│   │   │   ├── useOrders.ts           # Orders API integration hook
│   │   │   ├── useProducts.ts         # Products API integration hook
│   │   │   └── useRFQs.ts             # RFQs API integration hook
│   │   └── permissions/
│   │       ├── permissions.ts         # Centralized role definitions & action checks
│   │       └── usePermissions.ts      # Permission state hook for components
│   │
│   ├── context/                       # Global React state contexts
│   │   ├── AuthContext.tsx            # Login, registration, token storage, OTP panel
│   │   └── CartContext.tsx            # Cart items, MOQ validation, coupon discounts
│   │
│   ├── components/                    # Reusable widgets & major hubs
│   │   ├── AuthPage.tsx               # Sign in / Sign up multi-step layouts
│   │   ├── Categories.tsx             # Homepage category navigation tiles
│   │   ├── Checkout.tsx               # Cart summary, address forms, checkout success
│   │   ├── ErrorBoundary.tsx          # Client crash prevention wrapper
│   │   ├── Hero.tsx                   # Homepage brand greeting
│   │   ├── MaterialsHub.tsx           # Materials listing, filter sidebar, grids
│   │   ├── Navbar.tsx                 # Search console input, cart count, user portal
│   │   ├── ProductDetail.tsx          # PDP: variants picker, volume discount sheets
│   │   ├── RfqForm.tsx                # RFQ posting questionnaire
│   │   ├── SearchPage.tsx             # Unified multi-domain query search
│   │   └── ServicesHub.tsx            # Trade listings, visit scheduling, quote requests
│   │
│   └── modules/                       # Role-gated dashboard directories
│       ├── admin/                     # Back-office administrator operations
│       │   ├── AdminLayout.tsx        # Common layout and sidebar navigation items
│       │   ├── AdminDashboard.tsx     # Section router & verification checks
│       │   ├── DashboardHome.tsx      # Platform analytics overview
│       │   ├── ProductManagement.tsx  # Product listing and CRUD modal form
│       │   ├── CategoryManagement.tsx # Interactive tree editor for categories
│       │   ├── BrandManagement.tsx    # Brand registry CRUD editor
│       │   ├── InventoryManagement.tsx# Stock overview & log adjust tools
│       │   ├── OrderManagement.tsx    # Order pipeline tracker
│       │   ├── RFQManagement.tsx      # RFQ list, simulated bids, quote compiler
│       │   ├── CustomerManagement.tsx # User account registry directory
│       │   ├── RoleManagement.tsx     # Granular role assignment tool
│       │   ├── ImportProducts.tsx     # CSV/XLSX catalog loader with validation preview
│       │   ├── ExportProducts.tsx     # Spreadsheet catalog exporter
│       │   ├── BulkUpdates.tsx        # Price and status mass updates
│       │   ├── SearchAnalytics.tsx    # Telemetry insights (popular & zero searches)
│       │   ├── AuditLogs.tsx          # Action logs timeline viewer
│       │   ├── Reports.tsx            # Procurement tax and sales analytics
│       │   └── Settings.tsx           # Application config variables editor
│       │
│       ├── business/                  # Business Customer (B2B) Portal
│       │   ├── layouts/BusinessLayout.tsx
│       │   ├── BusinessDashboard.tsx  # Spent logs & order counts summary
│       │   ├── BusinessProjects.tsx   # Project milestones tracker
│       │   ├── BusinessRFQs.tsx       # RFQs pipeline and quote comparison
│       │   └── BusinessInvoices.tsx   # Tax invoice downloads
│       │
│       ├── individual/                # Retail Customer (B2C) Portal
│       │   ├── layouts/IndividualLayout.tsx
│       │   ├── IndividualDashboard.tsx# Profile card & settings navigation
│       │   ├── IndividualOrders.tsx   # Order history listings
│       │   ├── IndividualAddresses.tsx# Address list CRUD forms
│       │   └── IndividualProfile.tsx  # Personal info editor
│       │
│       └── professional/              # Contractor Partner Portal
│           ├── layouts/ProfessionalLayout.tsx
│           └── ProfessionalDashboard.tsx # Bookings timeline & profile review
│
├── scripts/                           # Database population utilities
│   ├── create_admin.cjs               # CLI tool to register admin accounts
│   └── populate_products.cjs          # CLI tool to seed products list
│
└── server/                            # Node.js Express Backend
    ├── package.json                   # Server dependency map
    ├── tsconfig.json                  # Compiler settings
    └── src/
        ├── index.ts                   # Main server initialization & REST routes
        ├── db.ts                      # Backend facade routing re-exports
        │
        ├── database/                  # Schema definition and integrity checks
        │   ├── db.ts                  # Postgres pool & JSON read/write controller
        │   ├── initDb.ts              # DDL runner & seed initiator
        │   ├── migrations.ts          # Postgres schema updater
        │   ├── migration_v1.sql       # Redesign migration schema SQL script
        │   ├── cleanup_legacy.sql     # Safe removal script for old structures
        │   ├── executeCleanup.ts      # Transactional cleanup DDL executor
        │   ├── healthCheck.ts         # Ping validation script
        │   ├── verifyApiContracts.ts  # Model validation script
        │   ├── verifyBuildPoints.ts   # Double-entry ledger audit script
        │   └── verifyInventory.ts     # Stock constraints auditing script
        │
        ├── modules/                   # Backend domain modules
        │   ├── analytics/
        │   │   ├── AuditLog.ts        # Audit Log interface
        │   │   └── AuditLogService.ts # Service for recording and fetching audit logs
        │   ├── catalog/
        │   │   ├── Product.ts         # Product model interfaces
        │   │   ├── ProductService.ts  # Catalog CRUD database operations
        │   │   ├── Category.ts        # Category model interfaces
        │   │   ├── CategoryService.ts # Category tree database operations
        │   │   ├── Brand.ts           # Brand model interfaces
        │   │   ├── BrandService.ts    # Brand registry database operations
        │   │   ├── ProductImportService.ts # Excel template verification & parsing
        │   │   ├── ProductExportService.ts # Catalog exporting to spreadsheet
        │   │   ├── CatalogSyncService.ts # Bulk sync & imports logging operations
        │   │   ├── ImportHistory.ts   # Import Log interface
        │   │   └── ImportHistoryService.ts # Service for loading import logs history
        │   ├── inventory/
        │   │   ├── Inventory.ts       # Inventory interfaces
        │   │   └── InventoryService.ts# Available/Reserved stock adjustments
        │   ├── orders/
        │   │   ├── Order.ts           # Order models
        │   │   └── OrderService.ts    # checkout logic & order history
        │   ├── rfq/
        │   │   ├── RFQ.ts             # RFQ & Quotation interfaces
        │   │   ├── RFQService.ts      # RFQ and booking submissions
        │   │   └── QuotationService.ts# Versioned quotations & conversion to orders
        │   ├── search/
        │   │   ├── Search.ts          # Search analytics interfaces
        │   │   └── SearchService.ts   # relevancy search and click logging
        │   ├── settings/
        │   │   ├── Settings.ts        # Configuration interfaces
        │   │   └── SettingsService.ts # App settings read/write operations
        │   └── users/
        │       ├── User.ts            # Identity models
        │       ├── UserService.ts     # Registration, OTP validation, profile adjustments
        │       └── permissions.ts     # Action check methods
        │
        └── seed/                      # Backend seeds data
            ├── categories.ts          # Default category tree seed
            ├── products.ts            # Seed catalog of 86 products
            └── settings.ts            # Default configuration settings
```

---

---

---

# Chapter 21: Module Ownership & Dependencies Registry

### 1. Authentication Module
* **Purpose**: Coordinates registration validation, OTP lifecycle, JWT generation, and password encryption.
* **Dependencies**: none.
* **Database Tables**: `users`, `otps`, `admin_profiles`.
* **APIs**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
* **Events Produced**: `USER_REGISTERED`, `USER_VERIFIED`.
* **Events Consumed**: none.
* **Shared Components**: `AuthPage.tsx`.
* **Side Effects**: Sets session tokens and cookies.
* **Constraints**: 5-minute timeout on OTP codes.
* **Future Improvements**: Twilio SMS client adapter integration.

### 2. Catalog Module
* **Purpose**: Hosts product listings, categories, variants, and volume pricing tables.
* **Dependencies**: none.
* **Database Tables**: `products`, `product_variants`, `product_price_tiers`, `categories`.
* **APIs**: `GET /api/products`, `GET /api/products/:id`.
* **Events Produced**: `CATALOG_UPDATED`.
* **Events Consumed**: none.
* **Shared Components**: `MaterialsHub.tsx`, `ProductDetail.tsx`.
* **Side Effects**: Enforces MOQs at checkout.
* **Constraints**: Enforces packaging multiple conditions.
* **Future Improvements**: Dynamic shipping tax grids based on local warehouse source pincodes.

### 3. Inventory Module
* **Purpose**: Manages variant stock levels, checks allocations, and raises reorder warnings.
* **Dependencies**: Catalog.
* **Database Tables**: `inventory`, `inventory_adjustments`.
* **APIs**: `PUT /api/admin/inventory/:id`.
* **Events Produced**: `INVENTORY_ADJUSTED`, `LOW_STOCK_ALERT`.
* **Events Consumed**: `ORDER_PLACED`, `ORDER_CANCELLED`.
* **Shared Components**: `InventoryManagement.tsx`.
* **Side Effects**: Signals back-office operations of low stocks.
* **Constraints**: Stocks must never drop below 0: `CHECK (available_stock >= 0)`.
* **Future Improvements**: Automatic reorder purchase order generation.

### 4. Orders Module
* **Purpose**: Handles order placements, checkout operations, cancellations, and invoice generation.
* **Dependencies**: Catalog, Inventory, Users, Loyalty.
* **Database Tables**: `orders`, `order_items`, `user_addresses`.
* **APIs**: `POST /api/orders`, `GET /api/orders`.
* **Events Produced**: `ORDER_PLACED`, `ORDER_STATUS_CHANGED`.
* **Events Consumed**: `QUOTE_APPROVED`.
* **Shared Components**: `Checkout.tsx`, `IndividualOrders.tsx`.
* **Side Effects**: Deduplicates shipping addresses.
* **Constraints**: Commits database writes in a transaction block.
* **Future Improvements**: Stripe/Razorpay live card processor setups.

### 5. RFQ Module
* **Purpose**: Manages B2B procurement submissions, requirements specs, and negotiations.
* **Dependencies**: Users, Catalog.
* **Database Tables**: `rfqs`, `rfq_items`.
* **APIs**: `POST /api/rfq`, `GET /api/rfqs`.
* **Events Produced**: `RFQ_SUBMITTED`, `RFQ_STATUS_CHANGED`.
* **Events Consumed**: `QUOTE_APPROVED`.
* **Shared Components**: `RfqForm.tsx`, `RFQManagement.tsx`.
* **Side Effects**: Updates B2B procurement dashboard status logs.
* **Constraints**: Strict verification of business profiles required.
* **Future Improvements**: Support multi-supplier bidding invitations.

### 6. Quotation Module
* **Purpose**: Drafts quotes, revised pricing versions, and converts approved quotes to orders.
* **Dependencies**: RFQ, Users, Orders.
* **Database Tables**: `quotations`, `quotation_items`.
* **APIs**: `POST /api/rfqs/:id/quotations`, `POST /api/quotations/:id/accept`.
* **Events Produced**: `QUOTE_SENT`, `QUOTE_APPROVED`.
* **Events Consumed**: `RFQ_SUBMITTED`.
* **Shared Components**: `QuotationBuilder.tsx`, `NegotiationCenter.tsx`.
* **Side Effects**: Commits new orders upon quotation approval.
* **Constraints**: Quote revisions must increment quotation version numbers.
* **Future Improvements**: PDF invoice export utility on quote acceptance.

### 7. Users Module
* **Purpose**: Distinguishes user accounts, business logs, individual profiles, and saved addresses.
* **Dependencies**: none.
* **Database Tables**: `users`, `individual_profiles`, `business_profiles`, `professional_profiles`.
* **APIs**: `POST /api/users/update-profile`, `POST /api/users/update-phone`.
* **Events Produced**: `USER_PROFILE_UPDATED`.
* **Events Consumed**: none.
* **Shared Components**: `PortalResolver.tsx`.
* **Side Effects**: Syncs profile roles.
* **Constraints**: Validates GSTIN format on business profile creations.
* **Future Improvements**: KYC validation for professionals listings.

### 8. Search Module
* **Purpose**: Matches search queries and logs click/query telemetry.
* **Dependencies**: Catalog.
* **Database Tables**: `search_queries`, `search_clicks`.
* **APIs**: `GET /api/search`, `POST /api/search/click`.
* **Events Produced**: `SEARCH_LOGGED`, `CLICK_LOGGED`.
* **Events Consumed**: none.
* **Shared Components**: `SearchPage.tsx`.
* **Side Effects**: Syncs query metrics to search analytics logs.
* **Constraints**: Runs telemetry logging asynchronously.
* **Future Improvements**: Implement PostgreSQL full-text search indexing (`tsvector`).

### 9. Analytics Module
* **Purpose**: Aggregates KPIs, click telemetry, and order counts for operations managers.
* **Dependencies**: Orders, Search.
* **Database Tables**: `orders`, `search_queries`, `audit_logs`.
* **APIs**: `GET /api/admin/dashboard-kpis`, `GET /api/admin/search-analytics`.
* **Events Produced**: none.
* **Events Consumed**: none.
* **Shared Components**: `AdminDashboard.tsx`.
* **Side Effects**: Feeds operations panels.
* **Constraints**: Optimizes query scan times using index columns.
* **Future Improvements**: Exportable Excel analytics reports.

### 10. Settings Module
* **Purpose**: Manages settings configurations (taxes, MOQ bounds, free shipping thresholds).
* **Dependencies**: none.
* **Database Tables**: `settings`.
* **APIs**: `GET /api/settings`, `POST /api/admin/settings`.
* **Events Produced**: `SETTINGS_UPDATED`.
* **Events Consumed**: none.
* **Shared Components**: none.
* **Side Effects**: Flushes settings parameters.
* **Constraints**: Falls back to hardcoded defaults if DB settings table is empty.
* **Future Improvements**: Multi-warehouse settings parameters.

### 11. Notifications Module
* **Purpose**: Dispatches Nodemailer SMTP alerts and system logs.
* **Dependencies**: Users.
* **Database Tables**: none.
* **APIs**: none.
* **Events Produced**: none.
* **Events Consumed**: `USER_REGISTERED`, `ORDER_PLACED`, `LOW_STOCK_ALERT`.
* **Shared Components**: none.
* **Side Effects**: Bypasses external servers in development local mode.
* **Constraints**: Enforces strict HTML templates validation.
* **Future Improvements**: Integrate Twilio SMS push notifications.

### 12. BuildPoints Module
* **Purpose**: Coordinates points calculations, ledger records, and redemption rules.
* **Dependencies**: Users, Orders.
* **Database Tables**: `buildpoints_wallets`, `buildpoints_ledger`.
* **APIs**: none (Internal services).
* **Events Produced**: `POINTS_AWARDED`, `POINTS_REDEEMED`.
* **Events Consumed**: `ORDER_PLACED`, `ORDER_CANCELLED`.
* **Shared Components**: `Navbar.tsx`.
* **Side Effects**: Validates ledger-wallet sum balance reconciliations.
* **Constraints**: Direct writes to the wallet balance column are forbidden.
* **Future Improvements**: Loyalty point expiration cron schedules.

### 13. Admin Module
* **Purpose**: Command Center controllers to edit products, adjust stock, and review audits.
* **Dependencies**: All services.
* **Database Tables**: All tables.
* **APIs**: `GET /api/admin/orders`, `GET /api/admin/users`, `GET /api/admin/audit-logs`.
* **Events Produced**: `ADMIN_ACTION_LOGGED`.
* **Events Consumed**: all events.
* **Shared Components**: `AdminDashboard.tsx`.
* **Side Effects**: Overrides stock and cancels bookings.
* **Constraints**: Restricted to users with the Admin scope.
* **Future Improvements**: OCR validation for GSTIN uploads.


---

---
◀️ **[Previous](DATABASE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](../business/BUSINESS_RULES.md)** ▶️
