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
├── .gitignore                    # Excludes .env, db.json, package-lock, diagnostic scripts
├── index.html                    # Vite HTML entry point
├── package.json                  # Frontend dependencies (React 19, Vite, Tailwind)
├── tailwind.config.js            # Custom design tokens & theme
├── vite.config.ts                # Vite dev server with /api proxy to :5000
├── shared/
│   └── validation.ts             # Isomorphic validators (phone, email, GSTIN, XSS, SQLi)
│
├── src/                          # React TypeScript SPA
│   ├── App.tsx                   # Hash router & top-level route declarations
│   ├── index.css                 # HSL design tokens, typography, utility classes
│   ├── main.tsx                  # React root mount
│   │
│   ├── core/                     # Shared frontend utilities
│   │   ├── auth/
│   │   │   └── PortalResolver.tsx     # Role-based portal redirect guard
│   │   ├── config/
│   │   │   └── format.ts              # Currency, date, number formatters
│   │   ├── hooks/
│   │   │   ├── useOrders.ts           # Orders API hook
│   │   │   ├── useProducts.ts         # Products API hook
│   │   │   └── useRFQs.ts             # RFQ API hook
│   │   └── permissions/
│   │       ├── permissions.ts         # Role capability definitions
│   │       └── usePermissions.ts      # Permission resolver hook
│   │
│   ├── context/
│   │   ├── AuthContext.tsx            # Global auth state (user, role, customerType)
│   │   └── CartContext.tsx            # Cart state, coupon engine, BuildPoints
│   │
│   ├── components/                # Page-level views & shared widgets
│   │   ├── AuthPage.tsx               # Login / Register / OTP
│   │   ├── Categories.tsx             # Homepage category grid
│   │   ├── Checkout.tsx               # Address form, order summary, payment
│   │   ├── ErrorBoundary.tsx          # Global React error boundary
│   │   ├── Hero.tsx                   # Homepage hero banner
│   │   ├── MaterialsHub.tsx           # Materials marketplace (PLP)
│   │   ├── Navbar.tsx                 # Global navigation bar
│   │   ├── ProductDetail.tsx          # Product detail page (PDP)
│   │   ├── RfqForm.tsx                # RFQ submission form
│   │   ├── SearchPage.tsx             # Platform-wide search results page
│   │   └── ServicesHub.tsx            # Services marketplace + contractor profiles
│   │
│   └── modules/                   # Role-scoped portal modules
│       ├── admin/                     # Admin portal (13 management screens)
│       │   ├── AdminLayout.tsx
│       │   ├── AdminDashboard.tsx
│       │   ├── ProductManagement.tsx
│       │   ├── CategoryManagement.tsx
│       │   ├── BrandManagement.tsx
│       │   ├── InventoryManagement.tsx
│       │   ├── OrderManagement.tsx
│       │   ├── RFQManagement.tsx
│       │   ├── CustomerManagement.tsx
│       │   ├── RoleManagement.tsx
│       │   ├── ImportProducts.tsx
│       │   ├── ExportProducts.tsx
│       │   ├── BulkUpdates.tsx
│       │   ├── SearchAnalytics.tsx
│       │   ├── AuditLogs.tsx
│       │   ├── Reports.tsx
│       │   ├── Settings.tsx
│       │   └── DashboardHome.tsx
│       ├── business/                  # Business (B2B) portal
│       │   ├── layouts/BusinessLayout.tsx
│       │   ├── BusinessDashboard.tsx
│       │   ├── BusinessProjects.tsx
│       │   ├── BusinessRFQs.tsx
│       │   └── BusinessInvoices.tsx
│       ├── individual/                # Individual (B2C) portal
│       │   ├── layouts/IndividualLayout.tsx
│       │   ├── IndividualDashboard.tsx
│       │   ├── IndividualOrders.tsx
│       │   ├── IndividualAddresses.tsx
│       │   └── IndividualProfile.tsx
│       └── professional/              # Professional / Contractor portal
│           ├── layouts/ProfessionalLayout.tsx
│           └── ProfessionalDashboard.tsx
│
├── scripts/
│   ├── create_admin.cjs              # CLI: seed admin user to DB
│   └── populate_products.cjs         # CLI: bulk-load product catalog
│
└── server/                        # Express Node.js API Server
    ├── package.json                   # Server dependencies (Express, pg, multer, xlsx, nodemailer)
    ├── tsconfig.json
    └── src/
        ├── index.ts                   # REST API entry — all routes & rate limiters
        ├── db.ts                      # Backwards-compatible re-export facade
        │
        ├── database/
        │   ├── db.ts                  # PostgreSQL pool + JSON file fallback
        │   ├── initDb.ts              # Table creation & seed coordinator
        │   ├── migrations.ts          # DDL schema migrations & constraint additions
        │   ├── cleanup_legacy.sql     # Phase 5: removes legacy schema artifacts
        │   ├── executeCleanup.ts      # Cleanup runner with transaction safety
        │   ├── healthCheck.ts         # DB connectivity health validator
        │   ├── verifyApiContracts.ts  # API contract regression tests
        │   ├── verifyBuildPoints.ts   # BuildPoints integrity checker
        │   └── verifyInventory.ts     # Inventory constraint validator
        │
        ├── modules/                   # Modular domain services
        │   ├── analytics/
        │   │   ├── AuditLog.ts        # Audit log model
        │   │   └── AuditLogService.ts # Admin action audit trail
        │   ├── catalog/
        │   │   ├── Product.ts         # Product model
        │   │   ├── ProductService.ts  # Product CRUD & normalizer
        │   │   ├── Category.ts        # Category model
        │   │   ├── CategoryService.ts # Category CRUD
        │   │   ├── Brand.ts           # Brand model
        │   │   ├── BrandService.ts    # Brand CRUD
        │   │   ├── CatalogSyncService.ts  # Cross-table catalog sync
        │   │   ├── ImportHistory.ts   # Import job model
        │   │   ├── ImportHistoryService.ts
        │   │   ├── ProductImportService.ts  # CSV/XLSX importer
        │   │   └── ProductExportService.ts  # CSV/XLSX exporter
        │   ├── inventory/
        │   │   ├── Inventory.ts       # Inventory model
        │   │   └── InventoryService.ts  # Reserve, release, reorder lifecycle
        │   ├── orders/
        │   │   ├── Order.ts           # Order + OrderItem models
        │   │   └── OrderService.ts    # Order placement & status transitions
        │   ├── rfq/
        │   │   ├── RFQ.ts             # RFQ, Booking, DirectQuote models
        │   │   └── RFQService.ts      # RFQ & booking management
        │   ├── search/
        │   │   ├── Search.ts          # SearchQueryLog & SearchClickLog models
        │   │   └── SearchService.ts   # Multi-domain relevance search + analytics
        │   ├── settings/
        │   │   ├── Settings.ts        # App settings model
        │   │   └── SettingsService.ts # Global config read/write
        │   └── users/
        │       ├── User.ts            # User & OtpRecord models
        │       ├── UserService.ts     # Auth, OTP, registration, profile updates
        │       └── permissions.ts     # Role-based permission definitions
        │
        └── seed/
            ├── categories.ts          # Material category hierarchy seed data
            ├── products.ts            # Product catalog seed (86 products)
            └── settings.ts            # Default app settings values
```

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
