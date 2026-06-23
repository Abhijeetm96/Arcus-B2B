-- ============================================================================
-- ARCUS Database Migration Script: V1 Normalized Redesign
-- Objectives: Normalization, Profile Separation, Price Tiers, Order Lines
-- Philosophy: Preserve → Migrate → Validate → Deprecate
-- ============================================================================

-- ----------------------------------------------------------------------------
-- STAGE 1: Create Enums & Types
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'customer_type_enum') THEN
        CREATE TYPE customer_type_enum AS ENUM ('INDIVIDUAL', 'BUSINESS', 'PROFESSIONAL');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_enum') THEN
        CREATE TYPE admin_role_enum AS ENUM ('SUPER_ADMIN', 'OPERATIONS_MANAGER', 'INVENTORY_MANAGER', 'SALES_MANAGER', 'CUSTOMER_SUPPORT');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status_enum') THEN
        CREATE TYPE product_status_enum AS ENUM ('ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON', 'DISCONTINUED', 'ARCHIVED', 'RFQ_ONLY');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rfq_status_enum') THEN
        CREATE TYPE rfq_status_enum AS ENUM ('Submitted', 'Open', 'Under Review', 'Quotes Received', 'Completed', 'Cancelled', 'Expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'buildpoints_transaction_type_enum') THEN
        CREATE TYPE buildpoints_transaction_type_enum AS ENUM ('EARNED', 'REDEEMED', 'ADJUSTED', 'EXPIRED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
        CREATE TYPE order_status_enum AS ENUM ('Pending', 'Confirmed', 'Dispatched', 'Out For Delivery', 'Delivered', 'Cancelled', 'Awaiting Payment');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'address_type_enum') THEN
        CREATE TYPE address_type_enum AS ENUM ('SHIPPING', 'BILLING', 'BOTH');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_enum') THEN
        CREATE TYPE verification_status_enum AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- STAGE 2: Create Redesigned Tables
-- ----------------------------------------------------------------------------

-- Individual B2C Profiles
CREATE TABLE IF NOT EXISTS individual_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    alternate_phone VARCHAR(50),
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Business B2B Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    gst_number VARCHAR(50) NOT NULL,
    pan_number VARCHAR(10),
    trade_license_url VARCHAR(255),
    verification_status verification_status_enum DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by VARCHAR(50) REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_gst_unique ON business_profiles(UPPER(gst_number));

-- Professional Contractor Profiles
CREATE TABLE IF NOT EXISTS professional_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_profile_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    service_category VARCHAR(100) NOT NULL,
    experience_years INTEGER NOT NULL DEFAULT 0,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    website_url VARCHAR(150),
    portfolio_url VARCHAR(150),
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INTEGER DEFAULT 0,
    verification_status verification_status_enum DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_professional_category ON professional_profiles(service_category);
CREATE INDEX IF NOT EXISTS idx_professional_location ON professional_profiles(state, city);

-- Admin & Internal Staff Profiles
CREATE TABLE IF NOT EXISTS admin_profiles (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    admin_role admin_role_enum NOT NULL DEFAULT 'SUPER_ADMIN',
    permissions JSONB DEFAULT '[]'::jsonb,
    assigned_departments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Addresses
CREATE TABLE IF NOT EXISTS user_addresses (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type address_type_enum NOT NULL DEFAULT 'SHIPPING',
    recipient_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    company_name VARCHAR(150),
    address_line_1 TEXT NOT NULL,
    address_line_2 TEXT,
    landmark VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON user_addresses(user_id);

-- Product SKU Variants
CREATE TABLE IF NOT EXISTS product_variants (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
    price NUMERIC(12,2) NOT NULL,
    procurement_price NUMERIC(12,2),
    unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'Piece',
    minimum_order_quantity INTEGER DEFAULT 1,
    order_multiple INTEGER DEFAULT 1,
    status product_status_enum NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);

-- Price Tiers per SKU Variant
CREATE TABLE IF NOT EXISTS product_price_tiers (
    id SERIAL PRIMARY KEY,
    variant_id VARCHAR(50) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    min_quantity INTEGER NOT NULL,
    max_quantity INTEGER NOT NULL,
    price NUMERIC(12,2) NOT NULL,
    discount_percentage NUMERIC(5,2) NOT NULL,
    CONSTRAINT chk_price_tiers_qty CHECK (min_quantity <= max_quantity)
);
CREATE INDEX IF NOT EXISTS idx_tiers_variant ON product_price_tiers(variant_id);

-- Product Image Gallery
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);

-- Product Suggestions (Accessories)
CREATE TABLE IF NOT EXISTS product_accessories (
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    accessory_product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (product_id, accessory_product_id)
);

-- Product Reviews
CREATE TABLE IF NOT EXISTS product_reviews (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    reviewer_user_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    reviewer_name VARCHAR(100) NOT NULL,
    reviewer_role VARCHAR(100),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'APPROVED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);

-- Inventory Stock Levels
CREATE TABLE IF NOT EXISTS inventory (
    variant_id VARCHAR(50) PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
    available_stock INTEGER NOT NULL DEFAULT 0,
    reserved_stock INTEGER NOT NULL DEFAULT 0,
    reorder_level INTEGER NOT NULL DEFAULT 10,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_stock_non_negative CHECK (available_stock >= 0 AND reserved_stock >= 0)
);

-- RFQ Items
CREATE TABLE IF NOT EXISTS rfq_items (
    id VARCHAR(50) PRIMARY KEY,
    rfq_id VARCHAR(50) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    item_name VARCHAR(150) NOT NULL,
    quantity VARCHAR(100) NOT NULL,
    specification_requirements JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);

-- RFQ Quotes Bidding
CREATE TABLE IF NOT EXISTS rfq_quotes (
    id VARCHAR(50) PRIMARY KEY,
    rfq_id VARCHAR(50) NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
    supplier_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quote_amount NUMERIC(12,2) NOT NULL,
    delivery_lead_time_days INTEGER NOT NULL,
    validity_date DATE NOT NULL,
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq ON rfq_quotes(rfq_id);
CREATE INDEX IF NOT EXISTS idx_rfq_quotes_supplier ON rfq_quotes(supplier_id);

-- BuildPoints Wallets
CREATE TABLE IF NOT EXISTS buildpoints_wallets (
    user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(50) NOT NULL DEFAULT 'BRONZE',
    lifetime_points_accumulated INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
);

-- BuildPoints Auditing Ledger
CREATE TABLE IF NOT EXISTS buildpoints_ledger (
    id SERIAL PRIMARY KEY,
    wallet_user_id VARCHAR(50) NOT NULL REFERENCES buildpoints_wallets(user_id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type buildpoints_transaction_type_enum NOT NULL,
    reference_type VARCHAR(50) NOT NULL,
    reference_id VARCHAR(50),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_points_ledger_wallet ON buildpoints_ledger(wallet_user_id);

-- Normalized Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id VARCHAR(50) NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    gst_rate NUMERIC(5,2) DEFAULT 18.00,
    tax_amount NUMERIC(12,2) NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);

-- ----------------------------------------------------------------------------
-- STAGE 3: Extract, Transform & Load (ETL) Data Backfill
-- ----------------------------------------------------------------------------

-- 1. Populate individual buyer profiles
INSERT INTO individual_profiles (user_id, full_name, alternate_phone)
SELECT id, COALESCE(full_name, name), phone_number FROM users
ON CONFLICT (user_id) DO NOTHING;

-- 2. Populate business profiles for B2B accounts
INSERT INTO business_profiles (user_id, company_name, gst_number)
SELECT id, company_name, gst_number 
FROM users 
WHERE customer_type = 'BUSINESS' OR role IN ('Business', 'Supplier', 'Contractor')
ON CONFLICT (user_id) DO NOTHING;

-- 3. Populate professional profiles for contractors
INSERT INTO professional_profiles (user_id, service_category, experience_years, city, state, website_url, portfolio_url)
SELECT 
    id, 
    COALESCE(service_category, 'General'), 
    COALESCE(NULLIF(regexp_replace(experience, '\D', '', 'g'), '')::integer, 0), 
    COALESCE(city, 'Unknown'), 
    COALESCE(state, 'Unknown'), 
    website, 
    portfolio_url
FROM users 
WHERE customer_type = 'PROFESSIONAL' OR role = 'Professional'
ON CONFLICT (user_id) DO NOTHING;

-- 4. Set up BuildPoints wallets & ledger initial balances
INSERT INTO buildpoints_wallets (user_id, balance, lifetime_points_accumulated)
SELECT id, COALESCE(build_points, 0), COALESCE(build_points, 0)
FROM users
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO buildpoints_ledger (wallet_user_id, points, transaction_type, reference_type, description)
SELECT id, COALESCE(build_points, 0), 'EARNED', 'ADMIN', 'Initial balance migration seed'
FROM users
WHERE COALESCE(build_points, 0) > 0
ON CONFLICT DO NOTHING;

-- 5. Establish standard product variants
INSERT INTO product_variants (id, product_id, sku, name, attributes, price, unit_of_measure, minimum_order_quantity, order_multiple, status)
SELECT 
    id, 
    id, 
    COALESCE(sku, 'SKU-' || UPPER(id)), 
    name, 
    specifications, 
    COALESCE(NULLIF(regexp_replace(price, '[^\d.]', '', 'g'), '')::numeric, 0.00),
    COALESCE(unit_of_measure, TRIM(REPLACE(unit, '/', '')), 'Piece'), 
    COALESCE(minimum_order_quantity, 1), 
    COALESCE(order_multiple, 1), 
    COALESCE(NULLIF(status, ''), 'ACTIVE')::product_status_enum
FROM products
ON CONFLICT (id) DO NOTHING;

-- 6. Setup inventory quantities
INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
SELECT 
    id, 
    COALESCE(inventory_available, stock, 100), 
    COALESCE(inventory_reserved, 0), 
    COALESCE(inventory_reorder_level, 10)
FROM products
ON CONFLICT (variant_id) DO NOTHING;

-- 7. Populate product price tiers
INSERT INTO product_price_tiers (variant_id, min_quantity, max_quantity, price, discount_percentage)
SELECT 
    p.id,
    (tier->>'min')::integer,
    (tier->>'max')::integer,
    (tier->>'price')::numeric,
    (tier->>'save')::numeric
FROM products p,
LATERAL jsonb_array_elements(p.price_tiers) AS tier
ON CONFLICT DO NOTHING;
