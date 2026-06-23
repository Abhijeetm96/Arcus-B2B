-- DDL Cleanup Script for ARCUS Database Redesign (Phase 4B)
-- WARNING: DO NOT EXECUTE THIS SCRIPT DURING PHASE 4.
-- This script contains DDL statements to alter tables and drop legacy columns once Phase 5 cleanup is approved.

-- 1. Drop deprecated columns from 'users' table
ALTER TABLE users
  DROP COLUMN IF EXISTS company_name,
  DROP COLUMN IF EXISTS gst_number,
  DROP COLUMN IF EXISTS service_category,
  DROP COLUMN IF EXISTS experience,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS state,
  DROP COLUMN IF EXISTS website,
  DROP COLUMN IF EXISTS portfolio_url,
  DROP COLUMN IF EXISTS build_points;

-- 2. Drop deprecated columns from 'products' table
ALTER TABLE products
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS price_tiers,
  DROP COLUMN IF EXISTS images,
  DROP COLUMN IF EXISTS reviews,
  DROP COLUMN IF EXISTS inventory_available,
  DROP COLUMN IF EXISTS inventory_reserved,
  DROP COLUMN IF EXISTS inventory_reorder_level;

-- 3. Drop deprecated columns from 'orders' table
ALTER TABLE orders
  DROP COLUMN IF EXISTS items,
  DROP COLUMN IF EXISTS shipping_address,
  DROP COLUMN IF EXISTS billing_address;
