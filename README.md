# 🏗️ ARCUS

<p align="center">
  <img src="docs/assets/logo.png" alt="ARCUS Logo" width="220" />
</p>

<p align="center">
  <strong>Build Faster. Procure Smarter. Deliver Better.</strong>
</p>

<p align="center">
  ARCUS is a full-stack, enterprise-grade construction commerce platform that enables builders, contractors, and individual property developers to procure building materials, hire verified professionals, submit Request for Quotes (RFQs), and manage project workflows from a single, unified ecosystem.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=flat-square" alt="Status Active" />
  <img src="https://img.shields.io/badge/Environment-Development-blue?style=flat-square" alt="Environment Development" />
  <img src="https://img.shields.io/badge/Version-2.0.0-orange?style=flat-square" alt="Version 2.0.0" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
</p>

---

## 🗺️ Quick Navigation

<p align="center">
  <a href="#-platform-overview">
    <img src="https://img.shields.io/badge/Overview-blue?style=for-the-badge" alt="Overview" />
  </a>
  <a href="#-module-status-dashboard">
    <img src="https://img.shields.io/badge/Status-green?style=for-the-badge" alt="Status" />
  </a>
  <a href="#-system-architecture">
    <img src="https://img.shields.io/badge/Architecture-purple?style=for-the-badge" alt="Architecture" />
  </a>
  <a href="#-project-structure">
    <img src="https://img.shields.io/badge/Structure-grey?style=for-the-badge" alt="Structure" />
  </a>
  <a href="#-deployment--installation">
    <img src="https://img.shields.io/badge/Installation-orange?style=for-the-badge" alt="Installation" />
  </a>
  <a href="#-roadmap">
    <img src="https://img.shields.io/badge/Roadmap-red?style=for-the-badge" alt="Roadmap" />
  </a>
  <a href="#-security">
    <img src="https://img.shields.io/badge/Security-brightgreen?style=for-the-badge" alt="Security" />
  </a>
</p>

---

## 🔍 Platform Overview

ARCUS digitizes the end-to-end construction procurement lifecycle:

| Domain | Description |
| :--- | :--- |
| **Materials Marketplace** | Browse and procure materials (cement, steel, CPVC, pipes) with bulk pricing tiers, dimensional variant support, B2B/B2C role-based pricing, and real-time inventory tracking |
| **Services Marketplace** | Discover and hire verified professionals — Plumbers, Electricians, Carpenters, Painters, Architects — with contractor profiles, ratings, booking, and quote request flows |
| **RFQ Engine** | Post detailed project RFQs and receive competitive supplier quotes; manage bid pipelines via a structured admin review flow |
| **BuildPoints & Loyalty** | Earn and redeem loyalty points on every purchase; apply discount coupons (`WELCOME5` for B2C, `ARCUS10` for B2B) |
| **Multi-Portal Dashboards** | Role-specific dashboards for Admins, Business accounts, Individual buyers, and Professional contractors |
| **Platform-Wide Search** | Unified real-time search across products, service categories, and professional profiles |

---

## 📊 Module Status Dashboard

| Module | Frontend | Backend | Database | Key Features | Priority |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Authentication & OTP** | 🟡 | 🟡 | 🟢 | Login/Register, 6-digit OTP, session tokens, GSTIN-linked B2B accounts | **Critical** |
| **Materials Marketplace** | 🟢 | 🟢 | 🟢 | Category browser, keyword search, PDP, bulk pricing tiers, B2B/B2C price split | **High** |
| **Services Marketplace** | 🟢 | 🟡 | 🟢 | Contractor profiles, specialization filters, Book a Visit, Request Quote, date+time+address booking | **High** |
| **RFQ Engine** | 🟡 | 🟢 | 🟢 | RFQ submission, bid simulator, status tracking, admin review panel | **High** |
| **BuildPoints & Loyalty** | 🟢 | 🔴 | 🔴 | Dashboard balance display, coupon validation; accrual triggers pending | **Medium** |
| **Cart & Checkout** | 🟢 | 🟢 | 🟢 | Address parser, billing toggle, coupon engine, MOQ/multiple enforcement, GSTIN display | **High** |
| **Admin Dashboard** | 🟢 | 🟢 | 🟢 | Product/category/brand CRUD, inventory management, order tracking, RFQ management, role management, audit logs, reports, search analytics, bulk updates, CSV/Excel import-export | **Critical** |
| **Business Dashboard** | 🟢 | 🟡 | 🟢 | Project list, RFQ submissions, invoice view | **High** |
| **Individual Dashboard** | 🟢 | 🟢 | 🟢 | Order history, saved addresses, profile management | **High** |
| **Professional Dashboard** | 🟢 | 🔴 | 🔴 | Profile view; booking and earnings management pending | **Medium** |
| **Platform-Wide Search** | 🟢 | 🟢 | 🟢 | Products, service categories, professionals; query logging & click analytics | **High** |
| **Security & Validation** | 🟢 | 🟢 | 🟢 | XSS sanitization, SQL injection guards, rate limiting, input validation, audit log | **Critical** |
| **Resources & Calculators** | 🟢 | 🟢 | 🟢 | Concrete volume estimator, steel bar calculator, quality audit checklists | **Medium** |

> 🟢 Ready &nbsp;&nbsp; 🟡 In Progress &nbsp;&nbsp; 🔴 Not Started

---

## 🎨 System Architecture

```mermaid
graph TD
    subgraph Client ["Vite + React 19 (SPA)"]
        App["App.tsx — Hash Router"] --> PortalResolver["PortalResolver.tsx — Role-Based Routing"]
        PortalResolver --> Portals["Admin / Business / Individual / Professional Portals"]
        App --> Contexts["AuthContext · CartContext"]
        App --> Hubs["MaterialsHub · ServicesHub · SearchPage · ProductDetail · Checkout"]
    end

    subgraph Core ["src/core — Shared Frontend Layer"]
        Permissions["permissions.ts — Role Guards"]
        Hooks["useProducts · useOrders · useRFQs — API Hooks"]
        Format["format.ts — Currency & Date Helpers"]
    end

    subgraph Shared ["shared/ — Isomorphic Validation"]
        Val["validation.ts — Phone · Email · GSTIN · XSS · SQLi"]
    end

    subgraph Server ["Express Node.js API (port 5000)"]
        Index["index.ts — REST Routes + Rate Limiters"] --> Modules
        subgraph Modules ["server/src/modules/"]
            Catalog["catalog/ — Product · Category · Brand · Import · Export"]
            Inventory["inventory/ — Stock lifecycle & reservations"]
            Orders["orders/ — Order placement & status"]
            RFQ["rfq/ — RFQ · Bookings · Direct Quotes"]
            Search["search/ — Multi-domain search & analytics"]
            Users["users/ — Auth · OTP · Profiles · Permissions"]
            Settings["settings/ — Global app config"]
            Analytics["analytics/ — Audit log service"]
        end
        Index --> DB["database/ — db.ts Pool · initDb · migrations"]
    end

    subgraph Database ["PostgreSQL (Supabase / Neon)"]
        PG[("PostgreSQL DB")]
    end

    Client -->|"HTTP /api/*"| Server
    DB --> PG
    Val -.- Client
    Val -.- Server
```

---

## 🔄 User Journey Flowcharts

### 1. Material Purchase Journey
```mermaid
graph LR
    A[Homepage] --> B[Materials Hub]
    B --> C[Category Browse]
    C --> D[Product Detail PDP]
    D --> E[Select Variant & Quantity]
    E --> F[Cart Drawer]
    F --> G[Checkout + Address]
    G --> H[Order Confirmed]
```

### 2. Professional Booking Journey
```mermaid
graph LR
    A[Homepage] --> B[Services Hub]
    B --> C[Select Trade Category]
    C --> D[Professional Profile]
    D -->|"Book a Visit"| E[Booking Modal — Name · Phone · Date · Time · Address]
    D -->|"Request Quote"| F[Quote Modal — Budget · Timeline · Address · Description]
```

### 3. RFQ Submission Journey
```mermaid
graph TD
    A[Builder / Buyer] -->|Post RFQ Specs| B[RFQ Engine]
    B -->|Notify Admin| C[Admin Console Review]
    C -->|Simulate Bids| D[Supplier Quote Dispatch]
    D -->|Approve Quote| E[Active Order Created]
```

### 4. Admin Flow
```mermaid
graph LR
    A[Admin Login] --> B[Admin Dashboard]
    B --> C[Products · Categories · Brands]
    B --> D[Orders · RFQs · Inventory]
    B --> E[Customers · Roles]
    B --> F[Import · Export · Bulk Updates]
    B --> G[Search Analytics · Audit Logs · Reports]
```

---

## 📂 Project Structure

```
ARCUS/
├── .gitignore                         # Excludes .env, db.json, package-lock, diagnostic scripts
├── index.html                         # Vite HTML entry point
├── package.json                       # Frontend deps: React 19, Vite 8, Tailwind CSS 3
├── tailwind.config.js                 # Custom HSL design tokens & extended theme
├── vite.config.ts                     # Dev server + /api/* proxy → localhost:5000
├── tsconfig.app.json / tsconfig.json  # TypeScript configuration
├── postcss.config.js                  # PostCSS + Autoprefixer
│
├── shared/
│   └── validation.ts                  # Isomorphic input validators
│                                      # (phone, email, GSTIN, XSS strip, SQLi guard)
│
├── src/                               # React 19 TypeScript SPA
│   ├── App.tsx                        # Hash-based router; all top-level route declarations
│   ├── index.css                      # HSL design tokens, typography scale, utility classes
│   ├── main.tsx                       # React DOM root mount
│   │
│   ├── core/                          # Shared, reusable frontend utilities
│   │   ├── auth/
│   │   │   └── PortalResolver.tsx     # Reads role from AuthContext; redirects to correct portal
│   │   ├── config/
│   │   │   └── format.ts              # formatCurrency(), formatDate(), formatWeight()
│   │   ├── hooks/
│   │   │   ├── useOrders.ts           # GET/POST /api/orders hook
│   │   │   ├── useProducts.ts         # GET /api/products hook with filters
│   │   │   └── useRFQs.ts             # GET/POST /api/rfqs hook
│   │   └── permissions/
│   │       ├── permissions.ts         # ROLE_PERMISSIONS map (Admin > Business > Individual)
│   │       └── usePermissions.ts      # usePermissions() hook — reads from AuthContext
│   │
│   ├── context/
│   │   ├── AuthContext.tsx            # user, role, customerType, login(), logout()
│   │   └── CartContext.tsx            # cart items, coupon engine, BuildPoints, totals
│   │
│   ├── components/                    # Full-page view components & shared widgets
│   │   ├── AuthPage.tsx               # Login / Register / OTP verification flow
│   │   ├── Categories.tsx             # Homepage category tile grid
│   │   ├── Checkout.tsx               # Shipping address, billing toggle, order summary
│   │   ├── ErrorBoundary.tsx          # React error boundary (wraps entire app)
│   │   ├── Hero.tsx                   # Homepage hero section
│   │   ├── MaterialsHub.tsx           # Materials PLP: filters, search, product cards
│   │   ├── Navbar.tsx                 # Top nav: search bar, cart icon, user menu
│   │   ├── ProductDetail.tsx          # PDP: variants, bulk pricing, B2B/B2C split, reviews
│   │   ├── RfqForm.tsx                # Multi-step RFQ submission form
│   │   ├── SearchPage.tsx             # Platform-wide search (products + services + pros)
│   │   └── ServicesHub.tsx            # Services hub, contractor listings, booking modals
│   │
│   └── modules/                       # Role-gated portal modules
│       ├── admin/                     # Admin portal — 17 screens
│       │   ├── AdminLayout.tsx        # Sidebar navigation layout
│       │   ├── DashboardHome.tsx      # KPI summary cards
│       │   ├── ProductManagement.tsx  # Product CRUD table
│       │   ├── CategoryManagement.tsx # Category tree editor
│       │   ├── BrandManagement.tsx    # Brand registry
│       │   ├── InventoryManagement.tsx# Stock levels & adjustment logs
│       │   ├── OrderManagement.tsx    # Order status pipeline
│       │   ├── RFQManagement.tsx      # RFQ pipeline & bid review
│       │   ├── CustomerManagement.tsx # User account directory
│       │   ├── RoleManagement.tsx     # Admin role & permission assignment
│       │   ├── ImportProducts.tsx     # CSV/XLSX bulk import with preview
│       │   ├── ExportProducts.tsx     # CSV/XLSX catalog export
│       │   ├── BulkUpdates.tsx        # Mass price/status update tool
│       │   ├── SearchAnalytics.tsx    # Query logs & click-through heatmap
│       │   ├── AuditLogs.tsx          # Admin action audit trail viewer
│       │   ├── Reports.tsx            # Revenue & order analytics
│       │   ├── Settings.tsx           # Global app config panel
│       │   └── types.ts               # Shared admin TypeScript interfaces
│       ├── business/                  # Business (B2B) portal
│       │   ├── layouts/BusinessLayout.tsx
│       │   ├── BusinessDashboard.tsx  # Spend summary, active orders, RFQ count
│       │   ├── BusinessProjects.tsx   # Project tracker
│       │   ├── BusinessRFQs.tsx       # RFQ list & status
│       │   └── BusinessInvoices.tsx   # Invoice download list
│       ├── individual/                # Individual (B2C) portal
│       │   ├── layouts/IndividualLayout.tsx
│       │   ├── IndividualDashboard.tsx
│       │   ├── IndividualOrders.tsx   # Order history with status tracking
│       │   ├── IndividualAddresses.tsx# Saved shipping addresses
│       │   └── IndividualProfile.tsx  # Profile edit form
│       └── professional/              # Professional / Contractor portal
│           ├── layouts/ProfessionalLayout.tsx
│           └── ProfessionalDashboard.tsx
│
├── scripts/
│   ├── create_admin.cjs               # CLI: inserts an admin user directly into DB
│   └── populate_products.cjs          # CLI: bulk-seeds product catalog from JSON
│
└── server/                            # Node.js + Express REST API
    ├── README.md                      # Server-specific architecture documentation
    ├── package.json                   # Deps: express, pg, multer, xlsx, nodemailer, dotenv
    ├── tsconfig.json
    └── src/
        ├── index.ts                   # 260+ REST endpoints, rate limiters, CORS, file upload
        ├── db.ts                      # Backwards-compatible re-export facade for index.ts
        │
        ├── database/
        │   ├── db.ts                  # pgPool init + readJsonDb/writeJsonDb fallback
        │   ├── initDb.ts              # CREATE TABLE IF NOT EXISTS + seed on startup
        │   ├── migrations.ts          # ALTER TABLE, new tables, indexes, check constraints
        │   ├── cleanup_legacy.sql     # Phase 5: DROP legacy columns (safe-to-remove only)
        │   ├── executeCleanup.ts      # Transactional cleanup runner with rollback guard
        │   ├── healthCheck.ts         # DB ping & table existence validator
        │   ├── verifyApiContracts.ts  # Regression: checks all critical columns still exist
        │   ├── verifyBuildPoints.ts   # Integrity: wallet balance ≥ 0, ledger sums match
        │   └── verifyInventory.ts     # Integrity: no negative stock, reserved ≤ available
        │
        ├── modules/                   # Domain-separated service layer
        │   ├── analytics/
        │   │   ├── AuditLog.ts
        │   │   └── AuditLogService.ts # insertAuditLog(), getAuditLogs()
        │   ├── catalog/
        │   │   ├── Product.ts         # Product, PriceTier, ProductVariant interfaces
        │   │   ├── ProductService.ts  # getAllProducts(), getProductById(), CRUD
        │   │   ├── Category.ts
        │   │   ├── CategoryService.ts
        │   │   ├── Brand.ts
        │   │   ├── BrandService.ts
        │   │   ├── CatalogSyncService.ts
        │   │   ├── ImportHistory.ts
        │   │   ├── ImportHistoryService.ts
        │   │   ├── ProductImportService.ts  # parseCSV/XLSX → upsert products
        │   │   └── ProductExportService.ts  # query → CSV/XLSX buffer
        │   ├── inventory/
        │   │   ├── Inventory.ts
        │   │   └── InventoryService.ts  # checkAvailability, reserveStock, releaseStock
        │   ├── orders/
        │   │   ├── Order.ts
        │   │   └── OrderService.ts    # addOrder(), getOrdersByUserId(), updateStatus()
        │   ├── rfq/
        │   │   ├── RFQ.ts             # RFQ, Booking, DirectQuote interfaces
        │   │   └── RFQService.ts
        │   ├── search/
        │   │   ├── Search.ts
        │   │   └── SearchService.ts   # searchAll(): products + services + professionals
        │   ├── settings/
        │   │   ├── Settings.ts
        │   │   └── SettingsService.ts # getAppSettings(), updateAppSettings()
        │   └── users/
        │       ├── User.ts            # User, OtpRecord interfaces
        │       ├── UserService.ts     # register, login, verifyOTP, updateProfile
        │       └── permissions.ts     # ROLE → permissions[] map
        │
        └── seed/
            ├── categories.ts          # 10 material categories with icons & hrefs
            ├── products.ts            # 86 products across cement, steel, plumbing, electrical
            └── settings.ts            # Default settings: MOQ, GST rate, shipping threshold
```

---

## 🗄️ Database Schema

ARCUS uses **PostgreSQL** as the primary database (with an automatic JSON file fallback for local development). All tables are created via `initDb.ts` and extended via `migrations.ts`.

### Entity Relationship Overview

```mermaid
erDiagram
    users ||--o| individual_profiles : "has"
    users ||--o| business_profiles : "has"
    users ||--o| professional_profiles : "has"
    users ||--o| admin_profiles : "has"
    users ||--o{ user_addresses : "has many"
    users ||--o{ orders : "places"
    users ||--o{ rfqs : "submits"
    users ||--o{ otps : "receives"
    users ||--|| buildpoints_wallets : "owns"
    buildpoints_wallets ||--o{ buildpoints_ledger : "tracks"
    products ||--o{ product_variants : "has"
    products ||--o{ product_images : "has"
    products ||--o{ product_reviews : "has"
    products ||--o{ product_accessories : "has"
    product_variants ||--o{ product_price_tiers : "has"
    product_variants ||--|| inventory : "tracked by"
    orders ||--o{ order_items : "contains"
    order_items }o--|| product_variants : "references"
    rfqs ||--o{ rfq_items : "contains"
    rfqs ||--o{ rfq_quotes : "receives"
    brands ||--o{ products : "manufactures"
```

### Tables

#### 👤 `users`
| Column | Type | Constraints |
|---|---|---|
| `id` | `VARCHAR(50)` | PRIMARY KEY |
| `name` | `VARCHAR(100)` | NOT NULL |
| `full_name` | `VARCHAR(100)` | |
| `email` | `VARCHAR(100)` | UNIQUE, NOT NULL |
| `phone` | `VARCHAR(50)` | UNIQUE (constraint) |
| `phone_number` | `VARCHAR(50)` | |
| `password_hash` | `VARCHAR(256)` | NOT NULL |
| `password_salt` | `VARCHAR(256)` | NOT NULL |
| `role` | `VARCHAR(50)` | NOT NULL |
| `customer_type` | `VARCHAR(50)` | DEFAULT `'INDIVIDUAL'` |
| `admin_role` | `VARCHAR(100)` | DEFAULT `'SUPER_ADMIN'` |
| `email_verified` | `BOOLEAN` | DEFAULT `FALSE` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT NOW |

#### 🔑 `otps`
| Column | Type | Constraints |
|---|---|---|
| `id` | `VARCHAR(50)` | PRIMARY KEY |
| `user_id` | `VARCHAR(50)` | FK → `users.id` CASCADE |
| `otp_hash` | `VARCHAR(256)` | NOT NULL |
| `expires_at` | `TIMESTAMPTZ` | NOT NULL |
| `attempts` | `INTEGER` | DEFAULT `0` |
| `created_at` | `TIMESTAMPTZ` | DEFAULT NOW |

#### 👤 `individual_profiles`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `VARCHAR(50)` | PK + FK → `users.id` CASCADE |
| `full_name` | `VARCHAR(100)` | NOT NULL |
| `alternate_phone` | `VARCHAR(50)` | |
| `preferred_language` | `VARCHAR(50)` | DEFAULT `'English'` |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | |

#### 🏢 `business_profiles`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `VARCHAR(50)` | PK + FK → `users.id` CASCADE |
| `company_name` | `VARCHAR(150)` | NOT NULL |
| `gst_number` | `VARCHAR(50)` | NOT NULL, UNIQUE (upper) |
| `pan_number` | `VARCHAR(10)` | |
| `trade_license_url` | `VARCHAR(255)` | |
| `verification_status` | `verification_status_enum` | DEFAULT `'PENDING'` |
| `verified_at` / `verified_by` | `TIMESTAMPTZ / VARCHAR` | |

#### 🔨 `professional_profiles`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `VARCHAR(50)` | PK + FK → `users.id` CASCADE |
| `service_category` | `VARCHAR(100)` | NOT NULL |
| `experience_years` | `INTEGER` | DEFAULT `0` |
| `city` / `state` | `VARCHAR(100)` | NOT NULL |
| `skills` | `JSONB` | DEFAULT `[]` |
| `average_rating` | `NUMERIC(3,2)` | DEFAULT `0.00` |
| `verification_status` | `verification_status_enum` | DEFAULT `'PENDING'` |

#### 🛡️ `admin_profiles`
| Column | Type | Constraints |
|---|---|---|
| `user_id` | `VARCHAR(50)` | PK + FK → `users.id` CASCADE |
| `admin_role` | `admin_role_enum` | DEFAULT `'SUPER_ADMIN'` |
| `permissions` | `JSONB` | DEFAULT `[]` |
| `assigned_departments` | `JSONB` | DEFAULT `[]` |

#### 📍 `user_addresses`
| Column | Type | Constraints |
|---|---|---|
| `id` | `VARCHAR(50)` | PRIMARY KEY |
| `user_id` | `VARCHAR(50)` | FK → `users.id` CASCADE |
| `address_type` | `address_type_enum` | `SHIPPING / BILLING / BOTH` |
| `recipient_name` | `VARCHAR(100)` | NOT NULL |
| `address_line_1` | `TEXT` | NOT NULL |
| `city / state / postal_code` | `VARCHAR` | NOT NULL |
| `is_default` | `BOOLEAN` | DEFAULT `FALSE` |

#### 📦 `products`
| Column | Type | Notes |
|---|---|---|
| `id` | `VARCHAR(50)` | PRIMARY KEY |
| `name` | `VARCHAR(100)` | NOT NULL |
| `category_id` / `category_title` | `VARCHAR` | Material group |
| `sku` / `brand` / `model` | `VARCHAR` | Catalog identifiers |
| `unit_of_measure` | `VARCHAR(50)` | Piece, Bag, Bundle, etc. |
| `hsn_code` | `VARCHAR(50)` | GST classification |
| `gst_rate` | `NUMERIC(5,2)` | Default `18` |
| `minimum_order_quantity` | `INTEGER` | DEFAULT `1` |
| `order_multiple` | `INTEGER` | DEFAULT `1` |
| `allow_b2b` / `allow_b2c` | `BOOLEAN` | DEFAULT `TRUE` |
| `status` | `VARCHAR(50)` | `ACTIVE / OUT_OF_STOCK / DISCONTINUED` |
| `specifications` | `JSONB` | Key-value spec map |
| `lead_time_days` | `INTEGER` | DEFAULT `3` |

#### 🎨 `product_variants`
| Column | Type | Constraints |
|---|---|---|
| `id` | `VARCHAR(50)` | PRIMARY KEY |
| `product_id` | `VARCHAR(50)` | FK → `products.id` CASCADE |
| `sku` | `VARCHAR(100)` | UNIQUE |
| `price` | `NUMERIC(12,2)` | NOT NULL |
| `attributes` | `JSONB` | Size, color, grade specs |
| `status` | `product_status_enum` | DEFAULT `'ACTIVE'` |

#### 💰 `product_price_tiers`
| Column | Type | Constraints |
|---|---|---|
| `id` | `SERIAL` | PRIMARY KEY |
| `variant_id` | `VARCHAR(50)` | FK → `product_variants.id` CASCADE |
| `min_quantity` | `INTEGER` | NOT NULL |
| `max_quantity` | `INTEGER` | NOT NULL, CHECK `min ≤ max` |
| `price` | `NUMERIC(12,2)` | NOT NULL |
| `discount_percentage` | `NUMERIC(5,2)` | NOT NULL |

#### 🖼️ `product_images` · `product_accessories` · `product_reviews`
| Table | Key Fields |
|---|---|
| `product_images` | `product_id`, `image_url`, `display_order`, `is_primary` |
| `product_accessories` | `product_id` + `accessory_product_id` (composite PK) |
| `product_reviews` | `product_id`, `reviewer_name`, `rating (1–5)`, `is_verified_purchase`, `status` |

#### 📊 `inventory`
| Column | Type | Constraints |
|---|---|---|
| `variant_id` | `VARCHAR(50)` | PK + FK → `product_variants.id` CASCADE |
| `available_stock` | `INTEGER` | NOT NULL, CHECK `≥ 0` |
| `reserved_stock` | `INTEGER` | NOT NULL, CHECK `≥ 0` |
| `reorder_level` | `INTEGER` | DEFAULT `10` |
| `updated_at` | `TIMESTAMPTZ` | |

#### 🏷️ `brands`
| Column | Type |
|---|---|
| `id` | `VARCHAR(50)` PK |
| `name` | `VARCHAR(100)` NOT NULL |
| `logo` | `VARCHAR(255)` |
| `description` | `TEXT` |
| `status` | `VARCHAR(50)` DEFAULT `'ACTIVE'` |

#### 📋 `categories`
| Column | Type |
|---|---|
| `id` | `VARCHAR(50)` PK |
| `name` | `VARCHAR(100)` NOT NULL |
| `icon` | `VARCHAR(50)` NOT NULL |
| `count` / `href` | `VARCHAR` |

#### 🛒 `orders` · `order_items`
| Table | Key Fields |
|---|---|
| `orders` | `id`, `user_id` (FK), `status` (enum), `amount`, `gst_number`, `payment_method`, `points_earned` |
| `order_items` | `order_id` (FK), `variant_id` (FK), `quantity`, `unit_price`, `gst_rate`, `tax_amount`, `total_amount` — CHECK `qty > 0` |

#### 📝 `rfqs` · `rfq_items` · `rfq_quotes`
| Table | Key Fields |
|---|---|
| `rfqs` | `id`, `name`, `phone`, `category`, `quantity`, `buyer_id`, `status` (enum), `title`, `budget`, `attachment_urls` |
| `rfq_items` | `rfq_id` (FK), `product_id` (FK), `item_name`, `quantity`, `specification_requirements` (JSONB) |
| `rfq_quotes` | `rfq_id` (FK), `supplier_id` (FK), `quote_amount`, `delivery_lead_time_days`, `validity_date`, `status` |

#### 📅 `bookings` · `quotes`
| Table | Key Fields |
|---|---|
| `bookings` | `id`, `service_name`, `name`, `phone`, `date`, `notes` |
| `quotes` | `id`, `contractor_id`, `contractor_company`, `name`, `phone`, `budget`, `timeline`, `description` |

#### 🏆 `buildpoints_wallets` · `buildpoints_ledger`
| Table | Key Fields |
|---|---|
| `buildpoints_wallets` | `user_id` (PK/FK), `balance` (CHECK `≥ 0`), `tier` (BRONZE/SILVER/GOLD), `lifetime_points_accumulated` |
| `buildpoints_ledger` | `wallet_user_id` (FK), `points`, `transaction_type` (EARNED/REDEEMED/ADJUSTED/EXPIRED), `reference_type`, `reference_id`, `description` |

#### 🔍 `search_queries` · `search_clicks`
| Table | Key Fields |
|---|---|
| `search_queries` | `id` (SERIAL), `query`, `results_count`, `timestamp` |
| `search_clicks` | `id` (SERIAL), `query`, `product_id`, `timestamp` |

#### ⚙️ `settings`
| Key | Example Value |
|---|---|
| `b2c_minimum_order_value` | `1000` |
| `default_gst_rate` | `18` |
| `free_shipping_threshold` | `5000` |
| `default_moq` | `1` |
| `quote_validity_days` | `30` |
| `search_enable_logging` | `true` |

#### 📜 `audit_logs` · `inventory_adjustments` · `import_history`
| Table | Key Fields |
|---|---|
| `audit_logs` | `id` (SERIAL), `action_type`, `details`, `performed_by`, `timestamp` |
| `inventory_adjustments` | `product_id` (FK), `adjustment_type`, `quantity`, `previous_stock`, `new_stock`, `reason`, `performed_by` |
| `import_history` | `id`, `file_name`, `mode`, `products_added`, `products_updated`, `products_failed`, `error_report` |

### Enums

| Enum | Values |
|---|---|
| `customer_type_enum` | `INDIVIDUAL`, `BUSINESS`, `PROFESSIONAL` |
| `admin_role_enum` | `SUPER_ADMIN`, `OPERATIONS_MANAGER`, `INVENTORY_MANAGER`, `SALES_MANAGER`, `CUSTOMER_SUPPORT` |
| `product_status_enum` | `ACTIVE`, `OUT_OF_STOCK`, `COMING_SOON`, `DISCONTINUED`, `ARCHIVED`, `RFQ_ONLY` |
| `order_status_enum` | `Pending`, `Confirmed`, `Dispatched`, `Out For Delivery`, `Delivered`, `Cancelled`, `Awaiting Payment` |
| `rfq_status_enum` | `Submitted`, `Open`, `Under Review`, `Quotes Received`, `Completed`, `Cancelled`, `Expired` |
| `buildpoints_transaction_type_enum` | `EARNED`, `REDEEMED`, `ADJUSTED`, `EXPIRED` |
| `address_type_enum` | `SHIPPING`, `BILLING`, `BOTH` |
| `verification_status_enum` | `PENDING`, `APPROVED`, `REJECTED` |

---

## 🧬 Component Mind Map

```mermaid
graph TD
    A[ARCUS Platform] --> B[Materials Hub]
    A --> C[Services Hub]
    A --> D[Portal Dashboards]
    A --> E[Orders & Checkout]
    A --> F[RFQ Engine]
    A --> G[BuildPoints Loyalty]
    A --> H[Authentication]
    A --> I[Search]
    A --> J[Admin Controls]

    B --> B1[Category Browser]
    B --> B2[Product PDP]
    B --> B3[Bulk Price Tiers]
    B --> B4[B2B / B2C Pricing]

    C --> C1[Contractor Listings]
    C --> C2[Profile Pages]
    C --> C3[Book a Visit Modal]
    C --> C4[Request Quote Modal]

    D --> D1[Admin Portal]
    D --> D2[Business B2B Portal]
    D --> D3[Individual B2C Portal]
    D --> D4[Professional Portal]

    E --> E1[Address Parser]
    E --> E2[Billing Toggle]
    E --> E3[Coupon Engine]
    E --> E4[MOQ Enforcement]

    F --> F1[RFQ Submission]
    F --> F2[Bid Simulator]
    F --> F3[Admin Review]

    G --> G1[Point Accruals]
    G --> G2[WELCOME5 / ARCUS10]

    H --> H1[OTP Verification]
    H --> H2[GSTIN B2B Auth]

    I --> I1[Products Search]
    I --> I2[Services Search]
    I --> I3[Professionals Search]

    J --> J1[Product & Category CRUD]
    J --> J2[Inventory Manager]
    J --> J3[Order & RFQ Tracking]
    J --> J4[Audit Logs & Reports]
```

---

## 🏁 Roadmap

```mermaid
timeline
    title ARCUS Development Roadmap
    Phase 1 : Authentication & OTP : Materials Hub MVP : Category Tree : Product Detail Pages
    Phase 2 : RFQ Engine : Verified Professionals : BuildPoints : Cart & Checkout
    Phase 3 : Modular Backend (PostgreSQL) : Role Dashboards : Import & Export : Platform Search
    Phase 4 : Schema Integrity Validation : Legacy Cleanup : API Contract Verification : Inventory Integrity
    Phase 5 : Legacy Schema Removal : Dead Code Cleanup : Search Expansion : UI Polish & Bug Fixes
    Phase 6 : Live Payments Gateway : Contractor Scheduling : Geo-Matching : Mobile App
```

---

## ⚙️ Deployment & Installation

<details>
<summary><b>🛠️ Prerequisites</b></summary>

- Node.js ≥ 18
- PostgreSQL database (Supabase, Neon, or local Postgres)
- npm ≥ 9

</details>

<details>
<summary><b>🔐 Environment Variables</b></summary>

Create a `.env` file under `server/`:

```ini
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

> Without `DATABASE_URL`, the server falls back to a local `server/data/db.json` file automatically.

</details>

<details>
<summary><b>🚀 Running Locally</b></summary>

#### 1. Start the API Backend
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

#### 2. Start the Frontend
```bash
# From project root
npm install
npm run dev
```
Frontend runs on `http://localhost:5174`

> The Vite dev server proxies all `/api/*` requests to `:5000` automatically.

</details>

<details>
<summary><b>🌱 Seed the Database</b></summary>

On first run, `initDb.ts` automatically:
- Creates all required tables
- Runs DDL migrations
- Seeds 86 products, material categories, and default settings

To manually seed an admin user:
```bash
node scripts/create_admin.cjs
```

</details>

<details>
<summary><b>🩺 Troubleshooting</b></summary>

| Issue | Fix |
| :--- | :--- |
| OTP in development | Use bypass code `123456` |
| `db.json` trigger nodemon restart | Handled via `server/nodemon.json` ignore patterns |
| PostgreSQL SSL error | Ensure `?sslmode=require` is set in `DATABASE_URL` |
| Port conflict on 5000 | Update `PORT` in `server/.env` and `vite.config.ts` proxy target |

</details>

---

## 📖 Documentation Hub

| Document | Location | Purpose |
| :--- | :--- | :--- |
| **Backend Architecture** | [`server/README.md`](server/README.md) | Modular server structure — modules, services, migrations |
| **System Architecture** | [`docs/architecture.md`](docs/architecture.md) | Frontend routing, middleware, and data flow |
| **Security Standards** | [`docs/security.md`](docs/security.md) | XSS, SQL injection guards, rate limiting |
| **Database Schema** | [`docs/database-schema.md`](docs/database-schema.md) | Table definitions, types, and constraints |
| **API Specification** | [`docs/api-specification.md`](docs/api-specification.md) | Endpoint listings, status codes, and payloads |
| **Design System** | [`docs/design-system.md`](docs/design-system.md) | HSL tokens, typography, and transitions |
| **Authentication Flow** | [`docs/authentication.md`](docs/authentication.md) | OTP sequence diagrams and session model |
| **Loyalty Program** | [`docs/loyalty-program.md`](docs/loyalty-program.md) | BuildPoints accrual ratios and coupon rules |
| **Validation Rules** | [`docs/validation-rules.md`](docs/validation-rules.md) | Phone normalization, GSTIN constraints |
| **Security Audit** | [`SECURITY_AUDIT_REPORT.md`](SECURITY_AUDIT_REPORT.md) | Full security assessment report |

---

## 🛡️ Security

- **Input validation**: Centralized phone, email, and GSTIN validators in `shared/validation.ts`
- **XSS protection**: HTML script tag sanitizer applied on all user-submitted text fields
- **SQL injection guards**: Keyword scrubber on all free-text inputs; parameterized queries in PostgreSQL services
- **Rate limiting**: `loginLimiter` (5 attempts / 15 min) and `otpLimiter` (3 attempts / 10 min) on auth endpoints
- **Audit trail**: All admin operations recorded in the `audit_logs` table via `AuditLogService`
- **Secrets**: `.env` is gitignored and never committed; `DATABASE_URL` stays local

---

## 🖼️ Screenshot Gallery

| Homepage | Materials Hub | Product Detail |
| :---: | :---: | :---: |
| ![Homepage](docs/screenshots/homepage.png) | ![Materials Hub](docs/screenshots/materials_hub.png) | ![Product Detail](docs/screenshots/pdp.png) |

---

<p align="center">
  Built with ❤️ for the construction industry &nbsp;·&nbsp; ARCUS © 2025
</p>
