# Chapter 4: Architecture Decision Records (ADRs)

---
◀️ **[Previous](ARCHITECTURE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ERD.md)** ▶️
---


This section documents the reasoning, options considered, and tradeoffs for key engineering decisions in the ARCUS platform.

### ADR 001: Relational PostgreSQL vs Document MongoDB
* **Problem**: Selecting a primary database engine that supports strict transactional integrity for materials checkout, inventory safety thresholds, and double-entry loyalty audits.
* **Options Considered**:
  1. *MongoDB (Document)*: High flexibility for product specifications, but lacks transactional reliability, constraints, and foreign key relations.
  2. *PostgreSQL (Relational)*: Strict schema controls, ACID compliance, check constraints, and nested JSONB support.
* **Final Decision**: **PostgreSQL** (deployed via Neon/Supabase).
* **Reasoning**: Relational normalization is necessary for core commerce records. Features like `CHECK (available_stock >= 0)` in inventory and double-entry auditing in the loyalty ledger require ACID transactions. Postgres JSONB handles dynamic product specs without sacrificing data integrity.
* **Tradeoffs**: Schema updates require structured migration scripts, resulting in slightly slower development iterations compared to schema-less MongoDB.
* **Future Considerations**: Integrate Redis caching to reduce reads on static lookup tables (e.g. Brands, Categories).

### ADR 002: Fully Normalized Schema vs Denormalized Tables
* **Problem**: Preventing data anomalies and duplicate strings (e.g. repeating address strings in orders, repeating company profiles for B2B users).
* **Options Considered**:
  1. *Denormalized Flat Tables*: Simple queries, but leads to data drift when users update profiles or saved addresses.
  2. *Fully Normalized Schema (3NF)*: Clean entities, but requires SQL JOINs on fetch queries.
* **Final Decision**: **Fully Normalized Schema (3NF)**.
* **Reasoning**: Segregating profiles (`individual_profiles`, `business_profiles`, `professional_profiles`) and addresses (`user_addresses`) ensures a single source of truth for user data. Updates to profile details propagate instantly across the system without affecting historical orders.
* **Tradeoffs**: Fetching a complete user profile requires multiple joins, slightly increasing query complexity.
* **Future Considerations**: Implement database views (`vw_user_complete_profile`) to simplify backend query definitions.

### ADR 003: Local JSON File Fallback (`db.json`)
* **Problem**: Enabling fast developer onboarding and local execution without requiring a running PostgreSQL server.
* **Options Considered**:
  1. *Dockerized Postgres*: Strict parity, but requires Docker and database setup.
  2. *JSON Fallback File*: Zero setup required, but requires custom service-level adapters to match Postgres query features.
* **Final Decision**: **JSON Fallback File (`server/data/db.json`)**.
* **Reasoning**: A built-in filesystem database allows the server to run out-of-the-box. The `db.ts` facade manages the active mode dynamically.
* **Tradeoffs**: File writes can suffer from timing issues under high concurrent write loads.
* **Future Considerations**: Migrate the fallback filesystem database to SQLite, maintaining zero-config usage while adding relational database behavior.

### ADR 004: Decoupled Product Variants (SKUs)
* **Problem**: Managing variants (sizes, classes, packaging) without repeating common product descriptors (name, category, brand, HSN codes).
* **Options Considered**:
  1. *Flat Product Entries*: Duplicate products for each size, leading to catalog bloat.
  2. *Embedded Variant Arrays*: Store variants inside a JSON array in the products table.
  3. *Decoupled Tables (`products` & `product_variants`)*: Normalized relation.
* **Final Decision**: **Decoupled Tables (`products` & `product_variants`)**.
* **Reasoning**: Separating variants into their own table enables precise inventory reservation checks, distinct pricing matrices per size, and clean foreign key references from order line items.
* **Tradeoffs**: Requires a JOIN query to render the Product Detail Page (PDP).
* **Future Considerations**: Implement variant-level image arrays for color-based variants.

### ADR 005: Double-Entry Loyalty Ledger
* **Problem**: Protecting the BuildPoints reward system against arbitrary balance manipulation and ensuring audit compliance.
* **Options Considered**:
  1. *Flat Increment*: Update the user balance column directly, which lacks a history log.
  2. *Ledger Auditing*: Log all adjustments in a transaction ledger and require the wallet balance to match the sum of transactions.
* **Final Decision**: **Ledger Auditing (`buildpoints_ledger` & `buildpoints_wallets`)**.
* **Reasoning**: Every point earned, redeemed, or expired is logged as an immutable ledger transaction. If a wallet balance does not match the sum of its ledger entries, the transaction fails.
* **Tradeoffs**: Requires dual-write operations on every points transaction.
* **Future Considerations**: Implement automated daily reconciliations to flag wallet-ledger anomalies.

### ADR 006: Versioned Quotations for RFQ Negotiations
* **Problem**: Supporting price negotiations and spec changes on RFQs while maintaining a record of previous drafts.
* **Options Considered**:
  1. *In-place Updates*: Overwrite the active quote, destroying negotiation history.
  2. *Versioned Quotes*: Incremental versioning (`QT-101-V1`, `QT-101-V2`) linked to a single RFQ.
* **Final Decision**: **Versioned Quotes**.
* **Reasoning**: Preserving version history allows buyers to compare iterations, provides audit trails, and lets administrators analyze negotiation behaviors.
* **Tradeoffs**: Increases database table storage for multi-round negotiations.
* **Future Considerations**: Implement an automated quote comparison matrix in the Business Buyer portal.

### ADR 007: Automated RFQ-to-Order Conversion
* **Problem**: Minimizing manual inputs for B2B procurement after a quotation is approved.
* **Options Considered**:
  1. *Manual Checkout*: Require buyers to enter quote details in the cart.
  2. *Automated Conversion*: Trigger order creation programmatically upon quote acceptance.
* **Final Decision**: **Automated Conversion (`convertQuotationToOrder()`)**.
* **Reasoning**: Reduces transactional friction, reserves inventory instantly, and applies pre-negotiated B2B credit terms automatically.
* **Tradeoffs**: Requires robust exception handling to handle credit limit overages during conversion.
* **Future Considerations**: Integrate B2B credit check APIs to validate buyer credit before allowing quote acceptance.

### ADR 008: Normalized Addresses during Checkout
* **Problem**: Extracting location statistics and ensuring address reuse without duplicating strings in the orders table.
* **Options Considered**:
  1. *Flat Order Address Strings*: Simplest structure, but prevents location analytics.
  2. *Normalized Address Registry*: Save shipping/billing records to `user_addresses` during checkout and link them to orders via address IDs.
* **Final Decision**: **Normalized Address Registry**.
* **Reasoning**: Checkout automatically parses address strings and matches them against existing saved records. If no match is found, it inserts a new address. This enables location-based logistics calculations.
* **Tradeoffs**: Requires address parsing logic in the backend.
* **Future Considerations**: Integrate Google Places API for address autocomplete.

### ADR 009: React Hash Router
* **Problem**: Supporting client-side routing on static hosting providers without causing 404 errors on page refresh.
* **Options Considered**:
  1. *HTML5 Browser History Routing (`BrowserRouter`)*: Clean URLs, but requires server-side rewrites.
  2. *Hash-Based Routing (`HashRouter`)*: Uses window hash (`#/path`), requiring zero server-side routing configuration.
* **Final Decision**: **Hash-Based Routing**.
* **Reasoning**: Hash routing works out-of-the-box on static hosts without requiring backend configuration.
* **Tradeoffs**: URLs include a `#`, which is less clean for SEO.
* **Future Considerations**: Switch to Browser Routing once production server routing rules are configured.

### ADR 010: Service-Oriented Backend Architecture
* **Problem**: Preventing backend routes from becoming bloated with business and database logic.
* **Options Considered**:
  1. *Fat Controllers*: Handle validation, business rules, and SQL queries directly inside Express route handlers.
  2. *Service Classes*: Isolate database queries and business logic inside dedicated Service modules, keeping route handlers thin.
* **Final Decision**: **Service Classes (`CatalogService`, `OrderService`, etc.)**.
* **Reasoning**: Placing logic inside services makes the codebase modular, testable, and easier to modify (e.g. swapping PostgreSQL queries for fallback JSON database functions).
* **Tradeoffs**: Requires developer discipline to maintain thin controllers.
* **Future Considerations**: Implement dependency injection to manage service lifecycles.

---

---

---
◀️ **[Previous](ARCHITECTURE.md)** | 🔼 **[Parent Section](../README.md)** | **[Next](ERD.md)** ▶️
