# ARCUS Database Migration: Deprecation Readiness Review

This document provides the dependency map and deprecation plan for the legacy ARCUS database structures. It ensures that all backend routes, service modules, and frontend pages are successfully decoupled from legacy fields before any columns or tables are deleted.

---

## 1. Column Deprecation Classification

Below is the classification of every denormalized legacy field. Columns are marked using the following states:
* 🔴 **Active**: Still read/written by production code. High migration dependency.
* 🟡 **Migration Required**: Code maps the field, but logic is being redirected to the new tables.
* 🟢 **Deprecated**: Written to as a dual-write fallback but no longer serves as the primary source of truth.
* 🔵 **Safe To Remove**: Completely unreferenced in code; clean to drop.

### Classification Matrix

| Table Name | Column Name | Target Table & Field | Current Status | Notes / Remediations Required |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `company_name` | `business_profiles(company_name)` | 🔴 **Active** | Used in B2B registrations and user profile APIs. |
| `users` | `gst_number` | `business_profiles(gst_number)` | 🔴 **Active** | Used in registration validation, profiling, and order checkout. |
| `users` | `service_category` | `professional_profiles(service_category)`| 🔴 **Active** | Used in Professional Directory searches and signup. |
| `users` | `experience` | `professional_profiles(experience_years)`| 🔴 **Active** | Read in directory filtering; must be parsed to integer. |
| `users` | `city` / `state` | `professional_profiles(city / state)` | 🔴 **Active** | Required for local contractor query routing. |
| `users` | `website` | `professional_profiles(website_url)` | 🔴 **Active** | Displayed in professional profiles. |
| `users` | `portfolio_url` | `professional_profiles(portfolio_url)` | 🔴 **Active** | Displayed in professional profiles. |
| `users` | `build_points` | `buildpoints_wallets(balance)` | 🔴 **Active** | Updated directly during order checkout updates. |
| `products` | `price` | `product_variants(price)` | 🔴 **Active** | Handled as VARCHAR with currency symbols (e.g. `₹280`). |
| `products` | `unit` | `product_variants(unit_of_measure)` | 🔴 **Active** | Handled as VARCHAR with slashes (e.g. `/ Piece`). |
| `products` | `stock` | `inventory(available_stock)` | 🔴 **Active** | Read during cart quantity checks and reorder sweeps. |
| `products` | `price_tiers` | `product_price_tiers` | 🔴 **Active** | Stored as a serialized JSONB array in products. |
| `products` | `images` | `product_images` | 🔴 **Active** | Stored as a serialized JSONB array in products. |
| `products` | `reviews` | `product_reviews` | 🔴 **Active** | Stored as a serialized JSONB array in products. |
| `orders` | `items` | `order_items` | 🔴 **Active** | Serialized order line items array. |
| `orders` | `shipping_address`| `user_addresses` | 🔴 **Active** | String address stored directly in orders record. |
| `orders` | `billing_address` | `user_addresses` | 🔴 **Active** | String address stored directly in orders record. |

---

## 2. Dependency Map

The following map details which frontend pages, backend routes, and service modules access these legacy fields:

```text
LEGACY FIELD             BACKEND PATH / SERVICE MODULE               FRONTEND PAGE / MODULE
─────────────────────────────────────────────────────────────────────────────────────────────
company_name  ◄───────►  POST /api/auth/register    ◄──────────────►  B2B Signup Form
                         GET  /api/auth/me          ◄──────────────►  Customer Profile Page
                         UserService.ts
                         
gst_number    ◄───────►  POST /api/orders           ◄──────────────►  Checkout Billing Form
                         GET  /api/admin/reports    ◄──────────────►  Admin Tax Reports
                         OrderService.ts
                         
build_points  ◄───────►  POST /api/orders           ◄──────────────►  Loyalty Summary Dashboard
                         GET  /api/auth/me          ◄──────────────►  Checkout Rewards Widget
                         UserService.ts
                         
price_tiers   ◄───────►  GET  /api/products/:id     ◄──────────────►  PDP (Product Details Page)
                         ProductService.ts          ◄──────────────►  Bulk Ordering Tool
                         
items (order) ◄───────►  GET  /api/orders           ◄──────────────►  Order History Dashboard
                         GET  /api/admin/reports    ◄──────────────►  Admin Sales Charts
                         OrderService.ts
```

### Dependency Inventory

#### 1. User & Company Fields (`company_name`, `gst_number`)
* **Backend Routes**:
  * `POST /api/auth/register` (reads company and GST details to approve B2B registrations).
  * `GET /api/auth/me` (sends company/GST details to frontend sessions).
  * `POST /api/users/profile` (updates company profile information).
* **Service Classes**:
  * [UserService.ts](file:///d:/Claude%20Code/Arcus/server/src/modules/users/UserService.ts#L60-L72) (handles DB mappings).
* **Frontend Pages**:
  * Profile Settings (`src/components/UserProfile.tsx`) - displays GSTIN/Company Name.
  * Admin B2B Approval dashboard - reviews submitted credentials.

#### 2. Loyalty Points (`build_points`)
* **Backend Routes**:
  * `POST /api/orders` (calculates and adds new points upon purchase completion).
  * `GET /api/auth/me` (retrieves loyalty balance).
* **Service Classes**:
  * [UserService.ts](file:///d:/Claude%20Code/Arcus/server/src/modules/users/UserService.ts#L71)
* **Frontend Pages**:
  * Portal Header (`src/components/Navbar.tsx`) - renders current BuildPoints balance.
  * Checkout Summary (`src/components/Checkout.tsx`) - uses points for discounts.

#### 3. Product Catalog Specs & Pricing (`price`, `price_tiers`, `stock`, `images`, `reviews`)
* **Backend Routes**:
  * `GET /api/products` & `GET /api/products/:id` (returns core item listings, pricing tiers, stocks, and review logs).
  * `POST /api/admin/products` (creates new catalog items and price structures).
* **Service Classes**:
  * [ProductService.ts](file:///d:/Claude%20Code/Arcus/server/src/modules/catalog/ProductService.ts) (reads and stringifies JSONB arrays).
  * [InventoryService.ts](file:///d:/Claude%20Code/Arcus/server/src/modules/inventory/InventoryService.ts) (reads and updates flat product stock).
* **Frontend Pages**:
  * Marketplace Grid (`src/components/MaterialsHub.tsx`) - displays price and stock status.
  * Product Page (`src/components/ProductDetail.tsx`) - renders image gallery, specifications, price tiers, and reviews.

#### 4. Order Line Items & Addresses (`items`, `shipping_address`, `billing_address`)
* **Backend Routes**:
  * `POST /api/orders` (parses items list and saves text address details).
  * `GET /api/orders` (retrieves order details).
  * `GET /api/admin/orders` (renders admin order history details).
* **Service Classes**:
  * [OrderService.ts](file:///d:/Claude%20Code/Arcus/server/src/modules/orders/OrderService.ts) (parses JSONB item arrays).
* **Frontend Pages**:
  * Checkout Checkout (`src/components/Checkout.tsx`) - sends raw address strings and item counts.
  * Order Summary Page - maps items array.

---

## 3. Deprecated APIs vs Normalized APIs

The following table details which current APIs read from legacy tables/columns and how they must be redirected:

| API Endpoint | Legacy Read/Write Source | Target Normalized Source | Action Required |
| :--- | :--- | :--- | :--- |
| `GET /api/auth/me` | `users` (dense row) | `users` JOIN `individual_profiles`/`business_profiles` | Modify query to fetch profile data via JOINs. |
| `GET /api/users/profile` | `users` (dense row) | `users` LEFT JOIN `professional_profiles` | Join with professional profiles table for contractors. |
| `GET /api/products` | `products` (JSONB arrays) | `products` JOIN `product_variants` | Join with variants table; extract primary images. |
| `GET /api/products/:id` | `products` (JSONB arrays) | `products` JOIN `product_variants` JOIN `product_price_tiers` | Fetch variants list, images, price tiers, and reviews from normalized tables. |
| `POST /api/orders` | `orders` (JSONB array, text addresses) | `orders` + `order_items` + `user_addresses` | Save lines to `order_items`, and reference address record IDs. |
| `GET /api/orders` | `orders` (JSONB array) | `orders` JOIN `order_items` JOIN `product_variants` | Fetch line items from `order_items` relation. |

---

## 4. Phased Deprecation Plan

To ensure zero downtime, the migration of code dependencies follows **four distinct phases**:

```mermaid
chronology
    title Dependency Deprecation Phases
    Phase 1 (Dual-Write Setup) : Setup database structures and run data backfill sync scripts.
    Phase 2 (API Read Redirection) : Update code to read from the new normalized tables.
    Phase 3 (Write Cleanup) : Stop writing to legacy columns.
    Phase 4 (Schema Cleanup) : Run DDL to drop legacy columns.
```

### Phase 1: Dual-Write Setup (Complete)
* **Goal**: Establish the target schema tables and backfill historical data.
* **Code Changes**: Database schema files updated. Dual-writes are initialized in backend services to keep both old and new tables in sync.

### Phase 2: API Read Redirection (Next Step)
* **Goal**: Shift all query paths (`SELECT` statements) in the codebase to read from the new tables.
* **Code Changes**:
  * Update `UserService.mapRowToUser()` to perform JOINs with `individual_profiles` and `business_profiles`.
  * Update `ProductService.mapRowToProduct()` to fetch SKUs and price structures from `product_variants` and `product_price_tiers`.
  * Update `OrderService` to retrieve items from `order_items`.
* **Testing**: Run integration validation scripts to assert API response structures remain identical.

### Phase 3: Write Cleanup (Write Redirection)
* **Goal**: Discontinue writing to the old columns in the legacy tables.
* **Code Changes**:
  * Remove legacy fields from insert/update queries on `users`, `products`, and `orders`.
  * Stop mapping legacy columns on writes, making target normalized tables the sole source of truth for writes.

### Phase 4: Schema Cleanup (Deprecation Complete)
* **Goal**: Remove deprecated columns to recover storage space.
* **Code Changes**: Run SQL drop queries to remove columns:
  * `users(company_name, gst_number, service_category, experience, city, state, website, portfolio_url, build_points)`.
  * `products(price, unit, stock, price_tiers, images, reviews, subcategory_slug, leaf_slug, category_title)`.
  * `orders(items, shipping_address, billing_address)`.
