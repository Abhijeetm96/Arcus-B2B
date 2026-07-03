/**
 * @file migrations.ts
 * @description Controls backend DDL schema updates and index/constraint applications for PostgreSQL.
 */

import { Pool } from 'pg';

/**
 * Runs DDL database migrations. Inserts missing columns, indices, and check
 * constraints to match the latest ARCUS commerce platform specifications.
 * 
 * @param {Pool} pgPool - The active PostgreSQL connection pool client.
 * @returns {Promise<void>} Resolves when all updates are applied.
 */
export async function runMigrations(pgPool: Pool): Promise<void> {
  console.log('🔄 Running database migrations...');

  // Enable pgcrypto and uuid-ossp for UUID generation
  await pgPool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `);

  // Detect and perform UUID/relational normalization for RFQ module
  const typeCheck = await pgPool.query(`
    SELECT data_type FROM information_schema.columns 
    WHERE table_name = 'rfqs' AND column_name = 'id'
  `);
  const colCheck = await pgPool.query(`
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'rfqs' AND column_name = 'customer_json'
  `);
  
  const needsRebuild = 
    (typeCheck.rows.length > 0 && typeCheck.rows[0].data_type === 'character varying') ||
    (colCheck.rows.length === 0);

  if (needsRebuild) {
    console.log('⚠️ Rebuilding RFQs database schema for relational UUID normalization...');
    await pgPool.query(`
      DROP TABLE IF EXISTS rfq_items CASCADE;
      DROP TABLE IF EXISTS rfq_quotes CASCADE;
      DROP TABLE IF EXISTS quotation_share_logs CASCADE;
      DROP TABLE IF EXISTS quotation_approvals CASCADE;
      DROP TABLE IF EXISTS quotation_versions CASCADE;
      DROP TABLE IF EXISTS quotation_totals CASCADE;
      DROP TABLE IF EXISTS quotation_items CASCADE;
      DROP TABLE IF EXISTS quotations CASCADE;
      DROP TABLE IF EXISTS approval_policies CASCADE;
      DROP TABLE IF EXISTS attachments CASCADE;
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS rfq_watchers CASCADE;
      DROP TABLE IF EXISTS rfq_assignments CASCADE;
      DROP TABLE IF EXISTS rfq_assignment_history CASCADE;
      DROP TABLE IF EXISTS rfq_comments CASCADE;
      DROP TABLE IF EXISTS rfqs CASCADE;
      DROP TYPE IF EXISTS rfq_status_enum CASCADE;
      DROP TYPE IF EXISTS priority_level_enum CASCADE;
      DROP TYPE IF EXISTS entity_type_enum CASCADE;
      DROP TYPE IF EXISTS quotation_status_enum CASCADE;
      DROP TYPE IF EXISTS share_status_enum CASCADE;
    `);
  }

  // Create new operational tables if not exist
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS brands (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      logo VARCHAR(255),
      description TEXT,
      status VARCHAR(50) DEFAULT 'ACTIVE'
    );

    CREATE TABLE IF NOT EXISTS inventory_adjustments (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      adjustment_type VARCHAR(50) NOT NULL,
      quantity INTEGER NOT NULL,
      previous_stock INTEGER NOT NULL,
      new_stock INTEGER NOT NULL,
      reason TEXT,
      performed_by VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action_type VARCHAR(100) NOT NULL,
      details TEXT NOT NULL,
      performed_by VARCHAR(100) NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS import_history (
      id VARCHAR(50) PRIMARY KEY,
      import_date VARCHAR(100) NOT NULL,
      imported_by VARCHAR(100) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      mode VARCHAR(50) NOT NULL,
      products_added INTEGER NOT NULL,
      products_updated INTEGER NOT NULL,
      products_failed INTEGER NOT NULL,
      error_report TEXT
    );
  `);
  
  // Ensure new verification and profile columns exist on users
  await pgPool.query(`
    ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
      ADD COLUMN IF NOT EXISTS phone_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL',
      ADD COLUMN IF NOT EXISTS admin_role VARCHAR(100) DEFAULT 'SUPER_ADMIN';
  `);

  // Validation & data integrity constraints
  await pgPool.query(`
    DROP INDEX IF EXISTS products_link_unique;
  `);
  await pgPool.query(`
    -- Unique phone number for users
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_phone_unique') THEN
        ALTER TABLE users ADD CONSTRAINT users_phone_unique UNIQUE (phone);
      END IF;
    END $$;

    -- Unique slug for products (on products table!)
    CREATE UNIQUE INDEX IF NOT EXISTS products_link_unique
      ON products (link)
      WHERE link IS NOT NULL AND link != '';

    -- Rating check constraint (between 0 and 5)
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_rating_check') THEN
        ALTER TABLE products ADD CONSTRAINT products_rating_check CHECK (rating::numeric >= 0.0 AND rating::numeric <= 5.0);
      END IF;
    END $$;
  `);

  console.log('🔄 Executing ARCUS normalized database redesign migrations...');
  
  // 1. Create Enums/Types
  await pgPool.query(`
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
            CREATE TYPE rfq_status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW', 'NEGOTIATION', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'priority_level_enum') THEN
            CREATE TYPE priority_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'entity_type_enum') THEN
            CREATE TYPE entity_type_enum AS ENUM ('RFQ', 'QUOTATION', 'ORDER', 'PRODUCT', 'SERVICE_BOOKING');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'quotation_status_enum') THEN
            CREATE TYPE quotation_status_enum AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'EXPIRED', 'CONVERTED', 'SENT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'share_status_enum') THEN
            CREATE TYPE share_status_enum AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'OPENED', 'CLICKED');
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
  `);

  // 2. Create target tables
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS individual_profiles (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        full_name VARCHAR(100) NOT NULL,
        alternate_phone VARCHAR(50),
        preferred_language VARCHAR(50) DEFAULT 'English',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS admin_profiles (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        admin_role admin_role_enum NOT NULL DEFAULT 'SUPER_ADMIN',
        permissions JSONB DEFAULT '[]'::jsonb,
        assigned_departments JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

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

    CREATE TABLE IF NOT EXISTS product_price_tiers (
        id SERIAL PRIMARY KEY,
        variant_id VARCHAR(50) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        min_quantity INTEGER NOT NULL,
        max_quantity INTEGER NOT NULL,
        price NUMERIC(12,2) NOT NULL,
        discount_percentage NUMERIC(5,2) NOT NULL,
        CONSTRAINT chk_price_tiers_qty CHECK (min_quantity <= max_quantity)
    );

    CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id VARCHAR(50) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url VARCHAR(255) NOT NULL,
        display_order INTEGER DEFAULT 0,
        is_primary BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS product_accessories (
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
        accessory_product_id VARCHAR(50) REFERENCES products(id) ON DELETE CASCADE,
        display_order INTEGER DEFAULT 0,
        PRIMARY KEY (product_id, accessory_product_id)
    );

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

    CREATE TABLE IF NOT EXISTS inventory (
        variant_id VARCHAR(50) PRIMARY KEY REFERENCES product_variants(id) ON DELETE CASCADE,
        available_stock INTEGER NOT NULL DEFAULT 0,
        reserved_stock INTEGER NOT NULL DEFAULT 0,
        reorder_level INTEGER NOT NULL DEFAULT 10,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_stock_non_negative CHECK (available_stock >= 0 AND reserved_stock >= 0)
    );

    CREATE TABLE IF NOT EXISTS rfqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_number VARCHAR(50) UNIQUE NOT NULL,
        version INTEGER DEFAULT 1 NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        category VARCHAR(100),
        quantity VARCHAR(100),
        location VARCHAR(100),
        timeline VARCHAR(100),
        details TEXT,
        created_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        updated_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        assigned_to_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        status rfq_status_enum DEFAULT 'SUBMITTED' NOT NULL,
        priority priority_level_enum DEFAULT 'MEDIUM' NOT NULL,
        due_date TIMESTAMP WITH TIME ZONE,
        reminder_date TIMESTAMP WITH TIME ZONE,
        deleted_at TIMESTAMP WITH TIME ZONE,
        deleted_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        buyer_id VARCHAR(50),
        title VARCHAR(255),
        budget VARCHAR(100),
        attachment_urls JSONB DEFAULT '[]'::jsonb,
        customer_json JSONB,
        project_type VARCHAR(100),
        value NUMERIC(12,2) DEFAULT 0.00,
        is_archived BOOLEAN DEFAULT FALSE NOT NULL,
        archived_at TIMESTAMP WITH TIME ZONE,
        archived_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS rfq_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
        item_name VARCHAR(150) NOT NULL,
        quantity VARCHAR(100) NOT NULL,
        specification_requirements JSONB NOT NULL DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS rfq_quotes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        supplier_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        quote_amount NUMERIC(12,2) NOT NULL,
        delivery_lead_time_days INTEGER NOT NULL,
        validity_date DATE NOT NULL,
        remarks TEXT,
        status VARCHAR(50) DEFAULT 'Submitted',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attachments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type entity_type_enum NOT NULL,
        entity_id UUID NOT NULL,
        filename VARCHAR(255) NOT NULL,
        storage_provider VARCHAR(50) DEFAULT 'local' NOT NULL,
        storage_key VARCHAR(255),
        public_url TEXT,
        thumbnail_url TEXT,
        mime_type VARCHAR(100) NOT NULL,
        size BIGINT NOT NULL,
        uploaded_by_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        version VARCHAR(20) DEFAULT 'v1.0' NOT NULL,
        previous_version_id UUID REFERENCES attachments(id) ON DELETE SET NULL,
        checksum VARCHAR(64)
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type entity_type_enum NOT NULL,
        entity_id UUID NOT NULL,
        action VARCHAR(100) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        performed_by_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        prev_value TEXT,
        new_value TEXT,
        metadata JSONB DEFAULT '{}'::jsonb
    );

    CREATE TABLE IF NOT EXISTS rfq_watchers (
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (rfq_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS rfq_assignments (
        rfq_id UUID PRIMARY KEY REFERENCES rfqs(id) ON DELETE CASCADE,
        primary_owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        secondary_owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        assigned_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        reason TEXT
    );

    CREATE TABLE IF NOT EXISTS rfq_assignment_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        primary_owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        secondary_owner_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        assigned_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        reason TEXT
    );

    CREATE TABLE IF NOT EXISTS rfq_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        author_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        author_name VARCHAR(100) NOT NULL,
        author_role VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        is_internal BOOLEAN DEFAULT TRUE,
        parent_comment_id UUID REFERENCES rfq_comments(id) ON DELETE SET NULL,
        edited_at TIMESTAMP WITH TIME ZONE,
        edited_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        is_deleted BOOLEAN DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS buildpoints_wallets (
        user_id VARCHAR(50) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        balance INTEGER NOT NULL DEFAULT 0,
        tier VARCHAR(50) NOT NULL DEFAULT 'BRONZE',
        lifetime_points_accumulated INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_balance_non_negative CHECK (balance >= 0)
    );

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

    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        variant_id VARCHAR(50) NOT NULL REFERENCES product_variants(id),
        quantity INTEGER NOT NULL,
        unit_price NUMERIC(12,2) NOT NULL,
        gst_rate NUMERIC(5,2) DEFAULT 18.00,
        tax_amount NUMERIC(12,2) NOT NULL,
        total_amount NUMERIC(12,2) NOT NULL,
        CONSTRAINT chk_order_items_qty CHECK (quantity > 0)
    );

    CREATE TABLE IF NOT EXISTS approval_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type entity_type_enum NOT NULL,
        min_amount NUMERIC(12,2) NOT NULL,
        max_amount NUMERIC(12,2) NOT NULL,
        required_role VARCHAR(100) NOT NULL,
        required_levels INTEGER DEFAULT 1 NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_number VARCHAR(50) NOT NULL UNIQUE,
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1,
        status quotation_status_enum NOT NULL DEFAULT 'DRAFT',
        customer_snapshot JSONB NOT NULL,
        public_token UUID DEFAULT gen_random_uuid() NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE,
        view_count INTEGER DEFAULT 0 NOT NULL,
        last_viewed_at TIMESTAMP WITH TIME ZONE,
        created_by_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        approved_by_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
        sent_at TIMESTAMP WITH TIME ZONE,
        approved_at TIMESTAMP WITH TIME ZONE,
        rejected_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP WITH TIME ZONE
    );

    CREATE TABLE IF NOT EXISTS quotation_totals (
        quotation_id UUID PRIMARY KEY REFERENCES quotations(id) ON DELETE CASCADE,
        currency_code VARCHAR(10) DEFAULT 'INR' NOT NULL,
        exchange_rate NUMERIC(12,6) DEFAULT 1.000000 NOT NULL,
        base_currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        exchange_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        subtotal NUMERIC(12,2) NOT NULL,
        discount NUMERIC(12,2) DEFAULT 0.00,
        taxable_amount NUMERIC(12,2) NOT NULL,
        gst_amount NUMERIC(12,2) NOT NULL,
        shipping NUMERIC(12,2) DEFAULT 0.00,
        other_charges NUMERIC(12,2) DEFAULT 0.00,
        grand_total NUMERIC(12,2) NOT NULL,
        calculation_audit JSONB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quotation_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
        product_snapshot JSONB NOT NULL,
        quantity NUMERIC(12,4) NOT NULL,
        rate NUMERIC(12,2) NOT NULL,
        discount_percent NUMERIC(5,2) DEFAULT 0.00,
        discount_amount NUMERIC(12,2) DEFAULT 0.00,
        tax_percent NUMERIC(5,2) DEFAULT 0.00,
        tax_amount NUMERIC(12,2) DEFAULT 0.00,
        subtotal NUMERIC(12,2) NOT NULL,
        final_amount NUMERIC(12,2) NOT NULL,
        remarks TEXT,
        position INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS quotation_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        created_by_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        reason TEXT,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quotation_approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        approver_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        approval_level INTEGER NOT NULL DEFAULT 1,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        signature_hash VARCHAR(256),
        signed_document_hash VARCHAR(256),
        certificate_id VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS quotation_share_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
        share_channel VARCHAR(50) NOT NULL,
        recipient VARCHAR(255),
        share_status share_status_enum NOT NULL DEFAULT 'PENDING',
        ip_address VARCHAR(50),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 3. Create indexes
  // Clean up duplicates if they exist to prevent unique index creation failures
  await pgPool.query(`
    DELETE FROM buildpoints_ledger a USING buildpoints_ledger b
    WHERE a.id > b.id 
      AND a.wallet_user_id = b.wallet_user_id 
      AND a.reference_type = b.reference_type 
      AND COALESCE(a.reference_id, '') = COALESCE(b.reference_id, '')
      AND a.transaction_type = b.transaction_type;

    DELETE FROM order_items a USING order_items b
    WHERE a.id > b.id 
      AND a.order_id = b.order_id 
      AND a.variant_id = b.variant_id;
  `);

  await pgPool.query(`
    CREATE INDEX IF NOT EXISTS idx_addresses_user ON user_addresses(user_id);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_tiers_variant ON product_price_tiers(variant_id);
    CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_rfq_items_rfq ON rfq_items(rfq_id);
    CREATE INDEX IF NOT EXISTS idx_rfq_quotes_rfq ON rfq_quotes(rfq_id);
    CREATE INDEX IF NOT EXISTS idx_rfq_quotes_supplier ON rfq_quotes(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_points_ledger_wallet ON buildpoints_ledger(wallet_user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_variant ON order_items(variant_id);
    CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON quotations(rfq_id);
    CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number);
    CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation ON quotation_items(quotation_id);
    CREATE INDEX IF NOT EXISTS idx_approval_policies_entity ON approval_policies(entity_type);
    
    -- Optimized indexes recommended by query plan evaluation
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_rfqs_buyer ON rfqs(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_leaf_slug ON products(leaf_slug);
    CREATE INDEX IF NOT EXISTS idx_professional_category ON professional_profiles(service_category);
    CREATE INDEX IF NOT EXISTS idx_professional_city ON professional_profiles(city);
    
    -- Normalized RFQ indices
    CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
    CREATE INDEX IF NOT EXISTS idx_rfqs_priority ON rfqs(priority);
    CREATE INDEX IF NOT EXISTS idx_rfqs_assigned ON rfqs(assigned_to_id);
    CREATE INDEX IF NOT EXISTS idx_rfqs_due ON rfqs(due_date);
    CREATE INDEX IF NOT EXISTS idx_rfqs_timestamp ON rfqs(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_rfqs_company ON rfqs ((customer_json->>'companyName'));
    
    CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_logs(entity_type, entity_id);
    CREATE INDEX IF NOT EXISTS idx_comments_rfq ON rfq_comments(rfq_id);
    CREATE INDEX IF NOT EXISTS idx_watchers_rfq ON rfq_watchers(rfq_id);
    CREATE INDEX IF NOT EXISTS idx_assignments_rfq ON rfq_assignments(rfq_id);
    
    -- Enforce uniqueness constraints
    CREATE UNIQUE INDEX IF NOT EXISTS idx_ledger_uniqueness 
    ON buildpoints_ledger(wallet_user_id, reference_type, reference_id, transaction_type);
    
    CREATE UNIQUE INDEX IF NOT EXISTS idx_order_items_uniqueness 
    ON order_items(order_id, variant_id);

    CREATE UNIQUE INDEX IF NOT EXISTS business_profiles_gst_unique 
    ON business_profiles(UPPER(gst_number));

    CREATE UNIQUE INDEX IF NOT EXISTS idx_approval_policies_unique 
    ON approval_policies(entity_type, min_amount, max_amount);
  `);

  console.log('✅ Database migrations applied successfully.');
}
