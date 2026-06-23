# ARCUS Backend - File & Architecture Documentation

This document describes the modular architecture of the ARCUS direct procurement backend server. The codebase has been refactored to isolate concerns, separating data definitions (Models), database configurations (Database/Migrations), seed catalogs (Seed), and business operations (Services).

---

## Directory Structure

```txt
server/src/
├── database/            # Database configuration & initialization
│   ├── db.ts            # Pool configuration & JSON fallback read/write
│   ├── initDb.ts        # Table creation & seeding coordinator
│   └── migrations.ts    # Schema updates, unique indexes & check constraints
├── models/              # TypeScript interface definitions (pure data schemas)
│   ├── Category.ts      # Category schema
│   ├── Inventory.ts     # Available, reserved, and reorder levels
│   ├── Order.ts         # Customer orders & itemized details
│   ├── Product.ts       # Materials catalog & price tiers
│   ├── RFQ.ts           # RFQs, service bookings, & direct quotes
│   ├── Search.ts        # Analytics click and query logs
│   ├── Settings.ts      # App settings (B2C order value threshold)
│   └── User.ts          # User credentials, roles, and OTP records
├── seed/                # Default catalogs & initial seed configurations
│   ├── categories.ts    # Primary categories (Plumbing, Electrical, etc.)
│   ├── products.ts      # Default product catalog (86 products populated)
│   └── settings.ts      # Default setting values (Minimum order value)
├── services/            # Business logic & query resolver operations
│   ├── CategoryService.ts   # Category CRUD
│   ├── InventoryService.ts  # Available/Reserved stock lifecycle and reservations
│   ├── OrderService.ts      # Order placements and status transitions
│   ├── ProductService.ts    # Product CRUD and row normalizer helpers
│   ├── RFQService.ts        # Contractor RFQs, bookings, and direct quotes
│   ├── SearchService.ts     # Relevance search, click tracking, & analytics
│   ├── SettingsService.ts   # Global app configuration settings
│   └── UserService.ts       # Authentication, user profiles, & OTP actions
├── db.ts                # Unified entrypoint re-exporting all service operations
└── index.ts             # REST API server & Express routing logic
```

---

## 1. Models Layer (`src/models/`)

Pure type declaration files. They do not contain any business logic or functions.

- **[Product.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Product.ts)**
  Defines the `Product` data structure including product identification (`productId`, `sku`, `brand`, `model`), prices, categories, tags, specifications, price tier brackets (`PriceTier`), and custom review lists.
- **[User.ts](file:///d:/Claude%20Code/Arcus/server/src/models/User.ts)**
  Defines the `User` and `OtpRecord` schemas. It supports role classification (`Buyer`, `Contractor`, `Supplier`, `Individual`, `Business`, `Professional`, `Admin`) and segment classification (`customerType: 'BUSINESS' | 'INDIVIDUAL'`).
- **[RFQ.ts](file:///d:/Claude%20Code/Arcus/server/src/models/RFQ.ts)**
  Declares the schema for bulk RFQ submissions (`RFQ`), professional service bookings (`Booking`), and contractor-direct bidding profiles (`DirectQuote`).
- **[Order.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Order.ts)**
  Defines customer transactions (`Order`) and itemized products (`OrderItem`) with delivery status tracking (`Pending`, `Awaiting Delivery`, `Out For Delivery`, `Delivered`, `Cancelled`, `Awaiting Payment`, `Confirmed`, `Dispatched`).
- **[Category.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Category.ts)**
  Declares the `Category` structure, mapping specific material groups to display icons and routes.
- **[Inventory.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Inventory.ts)**
  Declares the granular stock metrics structure (`available`, `reserved`, `reorderLevel`).
- **[Settings.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Settings.ts)**
  Declares global configurations such as `b2cMinimumOrderValue`.
- **[Search.ts](file:///d:/Claude%20Code/Arcus/server/src/models/Search.ts)**
  Declares telemetry tracking models (`SearchQueryLog` and `SearchClickLog`) for search analysis.

---

## 2. Database & Migrations (`src/database/`)

Manages low-level connections, table definitions, and DDL migrations.

- **[db.ts](file:///d:/Claude%20Code/Arcus/server/src/database/db.ts)**
  Detects the environment `DATABASE_URL`. If present, instantiates a PostgreSQL Connection Pool (`pgPool`). Otherwise, falls back to local JSON file storage (`server/data/db.json`). Exports `readJsonDb` and `writeJsonDb` for fallback storage operations.
- **[initDb.ts](file:///d:/Claude%20Code/Arcus/server/src/database/initDb.ts)**
  Initializes tables if they do not exist. Seeds default configuration settings, material category hierarchies, and normalizes and seeds the initial product catalog on startup.
- **[migrations.ts](file:///d:/Claude%20Code/Arcus/server/src/database/migrations.ts)**
  Executes DDL schema updates dynamically (such as adding B2C settings, B2B product columns, user profile parameters, indexes, check constraints, and unique keys).

---

## 3. Services Layer (`src/services/`)

Contains the core business operations and queries.

- **[ProductService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/ProductService.ts)**
  Provides product catalog queries (`getAllProducts`, `getProductById`) and admin management helpers (`addProduct`, `updateProduct`, `deleteProduct`). Includes the `mapRowToProduct` database row deserializer.
- **[InventoryService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/InventoryService.ts)**
  Implements real-time inventory lifecycle changes:
    - `checkAvailability()`: Verifies if catalog stock meets the ordered quantity.
    - `reserveStock()`: Reserves available items when an order is placed (`available - qty`, `reserved + qty`).
    - `releaseStock()`: Handles status completions. If cancelled, returns items back to available (`available + qty`, `reserved - qty`). If fulfilled/delivered, removes items from reservation (`reserved - qty`).
    - `reorderChecks()`: Flags warning logs when available inventory drops below the designated reorder level.
- **[SearchService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/SearchService.ts)**
  Implements relevance search. Scans product names, brands, descriptions, and category tags to compute matches. Automatically logs queries to `search_queries` and clicks to `search_clicks` for search insights.
- **[SettingsService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/SettingsService.ts)**
  Provides read and write operations for configuring global settings (`getAppSettings`, `updateAppSettings`).
- **[CategoryService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/CategoryService.ts)**
  Manages material category collections.
- **[RFQService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/RFQService.ts)**
  Resolves RFQ submissions, booking schedules, contractor direct quotes, and RFQ status changes.
- **[OrderService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/OrderService.ts)**
  Handles order registrations (`addOrder`), user transaction histories (`getOrdersByUserId`), individual details, and status updates.
- **[UserService.ts](file:///d:/Claude%20Code/Arcus/server/src/services/UserService.ts)**
  Coordinates credentials validation, registration check constraints (unique phone, unique email, single-GST account restriction), profile updates, and authentication OTP generation and tracking.

---

## 4. Re-export entrypoint (`src/db.ts`)

Serves as the backwards-compatible facade for the server application. It imports and re-exports all methods, connection instances, and model interfaces from the underlying subfolders, allowing the Express controllers in `index.ts` to query `db.ts` exactly as before.

---

## 5. Main Application Routing (`src/index.ts`)

Binds REST endpoints to Express. Extends routes to authenticate users, apply rate limits (`loginLimiter`, `otpLimiter`), validate email/phone format, parse payloads, and handle errors.
Key endpoint groups include:
- **`/api/auth`**: User registration, authentication logins, profiles, and OTP verification.
- **`/api/products`**: Fetching catalogs, product detail views, and reviews.
- **`/api/orders`**: Placing orders, verifying B2C minimum values or B2B MOQ/multiple restrictions, and adjusting inventory metrics.
- **`/api/rfqs`** & **`/api/bookings`**: Quote requests, file attachments, and schedules.
- **`/api/admin`**: Catalog CRUD, category editors, inventory managers, RFQ tracking, search analytics, and global settings updates.
