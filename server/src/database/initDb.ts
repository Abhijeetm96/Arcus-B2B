/**
 * @file initDb.ts
 * @description Controls table setup and initial seed populating sequence.
 */

import fs from 'fs';
import { Pool } from 'pg';
import { pgPool, usePostgres, setUsePostgres, DB_DIR, DB_FILE, readJsonDb, writeJsonDb } from './db';
import { runMigrations } from './migrations';
import { defaultCategories } from '../seed/categories';
import { defaultProducts } from '../seed/products';
import { Product } from '../modules/catalog/Product';
import { Category } from '../modules/catalog/Category';

/**
 * Maps raw legacy seeds or new incomplete parameters into the standardized Product type structure.
 * @param {any} p - The raw product seed input.
 * @param {number} i - The iteration index used to formulate unique identifiers.
 * @returns {Product} A validated, normalized Product instance.
 */
function normalizeProductForSeeding(p: any, i: number): Product {
  const id = p.link ? p.link.split('/').pop()! : `prod_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 5)}`;
  const priceVal = typeof p.price === 'number' ? p.price : parseFloat(String(p.price || '0').replace(/[^\d.]/g, '')) || 0;
  const categoryId = p.categoryTitle ? p.categoryTitle.toLowerCase() : 'materials';
  const unitOfMeasure = p.unit ? p.unit.replace(/^\/\s*/, '') : 'Piece';
  
  let moq = 1;
  let multiple = 1;
  if (categoryId === 'cement') {
    moq = 50;
    multiple = 10;
  } else if (p.name.toLowerCase().includes('cpvc pipe')) {
    moq = 10;
    multiple = 5;
  } else if (categoryId === 'plumbing') {
    moq = 5;
    multiple = 1;
  } else if (categoryId === 'electrical') {
    moq = 5;
    multiple = 1;
  }

  let brand = p.specifications?.['Brand'] || p.specifications?.['Manufacturer'] || '';
  if (!brand) {
    const parts = p.name.split(' ');
    brand = parts[0] || 'ARCUS';
  }
  const model = p.name;

  return {
    id,
    productId: id,
    sku: `SKU-${id.toUpperCase()}`,
    brand,
    model,
    name: p.name,
    description: p.description || undefined,
    categoryId,
    subcategorySlug: p.subcategorySlug || undefined,
    leafSlug: p.leafSlug || undefined,
    price: priceVal,
    unitOfMeasure,
    hsnCode: p.hsnCode || 'HSN-8481',
    gstRate: p.gstRate !== undefined ? p.gstRate : 18,
    inventory: {
      available: p.stock !== undefined ? p.stock : 100,
      reserved: 0,
      reorderLevel: 10
    },
    minimumOrderQuantity: moq,
    minimumOrderUnit: unitOfMeasure,
    orderMultiple: multiple,
    allowB2B: true,
    allowB2C: true,
    leadTimeDays: 3,
    status: 'ACTIVE',
    specifications: p.specifications || {},
    images: p.images || [],
    priceTiers: p.priceTiers || [],
    recommendedAccessories: p.recommendedAccessories || [],
    reviews: p.reviews || [],
    categoryTitle: p.categoryTitle || 'Materials',
    unit: p.unit || `/ ${unitOfMeasure}`,
    stock: p.stock !== undefined ? p.stock : 100,
    link: p.link || `#/product/${id}`,
    icon: p.icon || 'inventory_2',
    rating: p.rating || '4.5'
  };
}

/**
 * Sets up and populates the fallback JSON file database if empty.
 * Migrates existing properties like prices and roles to match new models.
 */
function initJsonDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialData = {
      rfqs: [],
      bookings: [],
      quotes: [],
      products: [],
      users: [],
      categories: defaultCategories,
      settings: { 
        b2cMinimumOrderValue: 1000,
        defaultGstRate: 18,
        freeShippingThreshold: 5000,
        defaultMoq: 1,
        defaultOrderMultiple: 1,
        rfqAutoAssignment: 'Unassigned',
        rfqNotifications: true,
        quoteValidityDays: 30,
        searchEnableLogging: true,
        notificationEmailAlerts: true
      },
      searchAnalytics: [],
      searchClicks: [],
      brands: [
        { id: 'astral', name: 'Astral', logo: '/brands_astral.png', description: 'Pipes & Fittings', status: 'ACTIVE' },
        { id: 'finolex', name: 'Finolex', logo: '/brands_finolex.png', description: 'Wires & Cables', status: 'ACTIVE' },
        { id: 'havells', name: 'Havells', logo: '/brands_havells.png', description: 'Electrical & Lighting', status: 'ACTIVE' },
        { id: 'ultratech', name: 'UltraTech', logo: '/brands_ultratech.png', description: 'Cement & Concrete', status: 'ACTIVE' },
        { id: 'jsw', name: 'JSW', logo: '/brands_jsw.png', description: 'Steel & Structural', status: 'ACTIVE' }
      ],
      inventoryAdjustments: [],
      auditLogs: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } else {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.products) {
        parsed.products = [];
        updated = true;
      }
      if (!parsed.users) {
        parsed.users = [];
        updated = true;
      }
      if (!parsed.orders) {
        parsed.orders = [];
        updated = true;
      }
      if (!parsed.categories) {
        parsed.categories = defaultCategories;
        updated = true;
      }
      if (!parsed.settings) {
        parsed.settings = { 
          b2cMinimumOrderValue: 1000,
          defaultGstRate: 18,
          freeShippingThreshold: 5000,
          defaultMoq: 1,
          defaultOrderMultiple: 1,
          rfqAutoAssignment: 'Unassigned',
          rfqNotifications: true,
          quoteValidityDays: 30,
          searchEnableLogging: true,
          notificationEmailAlerts: true
        };
        updated = true;
      } else {
        let settingsUpdated = false;
        if (parsed.settings.b2cMinimumOrderValue === undefined) { parsed.settings.b2cMinimumOrderValue = 1000; settingsUpdated = true; }
        if (parsed.settings.defaultGstRate === undefined) { parsed.settings.defaultGstRate = 18; settingsUpdated = true; }
        if (parsed.settings.freeShippingThreshold === undefined) { parsed.settings.freeShippingThreshold = 5000; settingsUpdated = true; }
        if (parsed.settings.defaultMoq === undefined) { parsed.settings.defaultMoq = 1; settingsUpdated = true; }
        if (parsed.settings.defaultOrderMultiple === undefined) { parsed.settings.defaultOrderMultiple = 1; settingsUpdated = true; }
        if (parsed.settings.rfqAutoAssignment === undefined) { parsed.settings.rfqAutoAssignment = 'Unassigned'; settingsUpdated = true; }
        if (parsed.settings.rfqNotifications === undefined) { parsed.settings.rfqNotifications = true; settingsUpdated = true; }
        if (parsed.settings.quoteValidityDays === undefined) { parsed.settings.quoteValidityDays = 30; settingsUpdated = true; }
        if (parsed.settings.searchEnableLogging === undefined) { parsed.settings.searchEnableLogging = true; settingsUpdated = true; }
        if (parsed.settings.notificationEmailAlerts === undefined) { parsed.settings.notificationEmailAlerts = true; settingsUpdated = true; }
        if (settingsUpdated) updated = true;
      }
      if (!parsed.searchAnalytics) {
        parsed.searchAnalytics = [];
        updated = true;
      }
      if (!parsed.searchClicks) {
        parsed.searchClicks = [];
        updated = true;
      }
      if (!parsed.brands) {
        parsed.brands = [
          { id: 'astral', name: 'Astral', logo: '/brands_astral.png', description: 'Pipes & Fittings', status: 'ACTIVE' },
          { id: 'finolex', name: 'Finolex', logo: '/brands_finolex.png', description: 'Wires & Cables', status: 'ACTIVE' },
          { id: 'havells', name: 'Havells', logo: '/brands_havells.png', description: 'Electrical & Lighting', status: 'ACTIVE' },
          { id: 'ultratech', name: 'UltraTech', logo: '/brands_ultratech.png', description: 'Cement & Concrete', status: 'ACTIVE' },
          { id: 'jsw', name: 'JSW', logo: '/brands_jsw.png', description: 'Steel & Structural', status: 'ACTIVE' }
        ];
        updated = true;
      }
      if (!parsed.inventoryAdjustments) {
        parsed.inventoryAdjustments = [];
        updated = true;
      }
      if (!parsed.auditLogs) {
        parsed.auditLogs = [];
        updated = true;
      }
      
      // Migrate existing products in JSON DB
      parsed.products = parsed.products.map((p: any, idx: number) => {
        let normalized = { ...p };
        if (typeof p.price === 'string') {
          normalized.price = parseFloat(p.price.replace(/[^\d.]/g, '')) || 0;
        }
        if (!p.productId) normalized.productId = p.id;
        if (!p.sku) normalized.sku = `SKU-${p.id.toUpperCase()}`;
        if (!p.brand) {
          const parts = p.name.split(' ');
          normalized.brand = parts[0] || 'ARCUS';
        }
        if (!p.model) normalized.model = p.name;
        if (!p.categoryId) normalized.categoryId = p.categoryTitle ? p.categoryTitle.toLowerCase() : 'materials';
        if (!p.unitOfMeasure) normalized.unitOfMeasure = p.unit ? p.unit.replace(/^\/\s*/, '') : 'Piece';
        if (!p.inventory) {
          normalized.inventory = {
            available: p.stock !== undefined ? p.stock : 100,
            reserved: 0,
            reorderLevel: 10
          };
        }
        if (normalized.minimumOrderQuantity === undefined) {
          const cat = normalized.categoryId.toLowerCase();
          if (cat === 'cement') {
            normalized.minimumOrderQuantity = 50;
            normalized.orderMultiple = 10;
          } else if (cat === 'steel') {
            normalized.minimumOrderQuantity = 1;
            normalized.orderMultiple = 1;
          } else if (p.name.toLowerCase().includes('cpvc pipe')) {
            normalized.minimumOrderQuantity = 10;
            normalized.orderMultiple = 5;
          } else if (cat === 'plumbing') {
            normalized.minimumOrderQuantity = 5;
            normalized.orderMultiple = 1;
          } else if (cat === 'electrical') {
            normalized.minimumOrderQuantity = 5;
            normalized.orderMultiple = 1;
          } else {
            normalized.minimumOrderQuantity = 1;
            normalized.orderMultiple = 1;
          }
        }
        if (normalized.minimumOrderUnit === undefined) {
          normalized.minimumOrderUnit = normalized.unitOfMeasure;
        }
        if (normalized.allowB2B === undefined) normalized.allowB2B = true;
        if (normalized.allowB2C === undefined) normalized.allowB2C = true;
        if (normalized.status === undefined) normalized.status = 'ACTIVE';
        return normalized;
      });

      // Migrate existing users in JSON DB to default customerType
      parsed.users = parsed.users.map((u: any) => {
        let normalized = { ...u };
        if (!u.customerType) {
          const role = u.role;
          if (['Business', 'Contractor', 'Supplier'].includes(role)) {
            normalized.customerType = 'BUSINESS';
          } else {
            normalized.customerType = 'INDIVIDUAL';
          }
        }
        if (normalized.buildPoints === undefined) {
          normalized.buildPoints = 0;
        }
        return normalized;
      });

      // Initialize new keys in JSON DB
      if (!parsed.individual_profiles) parsed.individual_profiles = [];
      if (!parsed.business_profiles) parsed.business_profiles = [];
      if (!parsed.professional_profiles) parsed.professional_profiles = [];
      if (!parsed.admin_profiles) parsed.admin_profiles = [];
      if (!parsed.user_addresses) parsed.user_addresses = [];
      if (!parsed.product_variants) parsed.product_variants = [];
      if (!parsed.product_price_tiers) parsed.product_price_tiers = [];
      if (!parsed.product_images) parsed.product_images = [];
      if (!parsed.product_accessories) parsed.product_accessories = [];
      if (!parsed.product_reviews) parsed.product_reviews = [];
      if (!parsed.inventory) parsed.inventory = [];
      if (!parsed.rfq_items) parsed.rfq_items = [];
      if (!parsed.rfq_quotes) parsed.rfq_quotes = [];
      if (!parsed.buildpoints_wallets) parsed.buildpoints_wallets = [];
      if (!parsed.buildpoints_ledger) parsed.buildpoints_ledger = [];
      if (!parsed.order_items) parsed.order_items = [];

      // Sync users to profiles in JSON DB
      parsed.users.forEach((u: any) => {
        if (!parsed.individual_profiles.some((p: any) => p.userId === u.id)) {
          parsed.individual_profiles.push({
            userId: u.id,
            fullName: u.fullName || u.full_name || u.name,
            alternatePhone: u.phoneNumber || u.phone_number || u.phone,
            preferredLanguage: 'English',
            createdAt: u.createdAt || u.created_at || new Date().toISOString()
          });
        }
        const isB2B = u.customerType === 'BUSINESS' || ['Business', 'Contractor', 'Supplier'].includes(u.role);
        if (isB2B && !parsed.business_profiles.some((p: any) => p.userId === u.id)) {
          parsed.business_profiles.push({
            userId: u.id,
            companyName: u.companyName || u.company_name || 'Generic Corp',
            gstNumber: u.gstNumber || u.gst_number || '29ABCDE1234F1Z5',
            verificationStatus: 'APPROVED',
            createdAt: u.createdAt || u.created_at || new Date().toISOString()
          });
        }
        const isPro = u.customerType === 'PROFESSIONAL' || u.role === 'Professional';
        if (isPro && !parsed.professional_profiles.some((p: any) => p.userId === u.id)) {
          parsed.professional_profiles.push({
            userId: u.id,
            serviceCategory: u.serviceCategory || u.service_category || 'General',
            experienceYears: parseInt(u.experience) || 0,
            city: u.city || 'Bengaluru',
            state: u.state || 'Karnataka',
            websiteUrl: u.website || '',
            portfolioUrl: u.portfolioUrl || u.portfolio_url || '',
            verificationStatus: 'APPROVED',
            createdAt: u.createdAt || u.created_at || new Date().toISOString()
          });
        }
        if (!parsed.buildpoints_wallets.some((w: any) => w.userId === u.id)) {
          parsed.buildpoints_wallets.push({
            userId: u.id,
            balance: u.buildPoints || 0,
            tier: 'BRONZE',
            lifetimePointsAccumulated: u.buildPoints || 0
          });
        }
      });

      // Sync products to variants and inventory in JSON DB
      parsed.products.forEach((p: any) => {
        if (!parsed.product_variants.some((v: any) => v.id === p.id)) {
          parsed.product_variants.push({
            id: p.id,
            productId: p.id,
            sku: p.sku || `SKU-${p.id.toUpperCase()}`,
            name: p.name,
            attributes: p.specifications || {},
            price: p.price,
            unitOfMeasure: p.unitOfMeasure || 'Piece',
            minimumOrderQuantity: p.minimumOrderQuantity || 1,
            orderMultiple: p.orderMultiple || 1,
            status: p.status || 'ACTIVE'
          });
        }
        if (!parsed.inventory.some((i: any) => i.availableStock === p.id)) { // unique on variantId
          const isExist = parsed.inventory.some((inv: any) => inv.variantId === p.id);
          if (!isExist) {
            parsed.inventory.push({
              variantId: p.id,
              availableStock: p.inventory?.available || p.stock || 100,
              reservedStock: p.inventory?.reserved || 0,
              reorderLevel: p.inventory?.reorderLevel || 10
            });
          }
        }
        if (p.priceTiers && Array.isArray(p.priceTiers)) {
          p.priceTiers.forEach((tier: any, tIdx: number) => {
            const tierId = `tier_${p.id}_${tIdx}`;
            if (!parsed.product_price_tiers.some((pt: any) => pt.variantId === p.id && pt.minQuantity === tier.min)) {
              parsed.product_price_tiers.push({
                id: tierId,
                variantId: p.id,
                minQuantity: tier.min,
                maxQuantity: tier.max,
                price: tier.price,
                discountPercentage: tier.save || 0
              });
            }
          });
        }
      });

      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
    } catch (e: any) {
      console.warn('❌ Error initializing JSON database keys:', e.message);
    }
  }
}

/**
 * Runs DDL creations, executes schema migrations, and seeds defaults.
 * @returns {Promise<void>}
 */
async function initDb() {
  initJsonDb();

  if (usePostgres && pgPool) {
    console.log('PostgreSQL connection detected. Initializing schema tables...');
    try {
      // Create tables
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS rfqs (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          category VARCHAR(100),
          quantity VARCHAR(100),
          location VARCHAR(100),
          timeline VARCHAR(100),
          details TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          service_name VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          date VARCHAR(50) NOT NULL,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS quotes (
          id VARCHAR(50) PRIMARY KEY,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          contractor_id VARCHAR(100) NOT NULL,
          contractor_company VARCHAR(150) NOT NULL,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          budget VARCHAR(50) NOT NULL,
          timeline VARCHAR(50) NOT NULL,
          description TEXT
        );

        CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(50) PRIMARY KEY,
          category_title VARCHAR(100) NOT NULL,
          name VARCHAR(100) NOT NULL,
          unit VARCHAR(50) NOT NULL,
          rating VARCHAR(10) NOT NULL,
          icon VARCHAR(50) NOT NULL,
          link VARCHAR(150),
          description TEXT,
          specifications JSONB,
          recommended_accessories JSONB,
          subcategory_slug VARCHAR(100),
          leaf_slug VARCHAR(100),
          minimum_order_unit VARCHAR(50) DEFAULT 'Piece',
          order_multiple INTEGER DEFAULT 1,
          allow_b2b BOOLEAN DEFAULT TRUE,
          allow_b2c BOOLEAN DEFAULT TRUE,
          minimum_order_quantity INTEGER DEFAULT 1,
          product_id VARCHAR(100),
          sku VARCHAR(100),
          brand VARCHAR(100),
          model VARCHAR(100),
          unit_of_measure VARCHAR(50),
          hsn_code VARCHAR(50),
          gst_rate NUMERIC(5,2),
          lead_time_days INTEGER DEFAULT 3,
          status VARCHAR(50) DEFAULT 'ACTIVE',
          category_id VARCHAR(50),
          procurement_price NUMERIC(12,2),
          vendor_name VARCHAR(100),
          vendor_product_code VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(50) PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          name VARCHAR(100) NOT NULL,
          full_name VARCHAR(100),
          email VARCHAR(100) UNIQUE NOT NULL,
          phone VARCHAR(50) NOT NULL,
          phone_number VARCHAR(50),
          password_hash VARCHAR(256) NOT NULL,
          password_salt VARCHAR(256) NOT NULL,
          role VARCHAR(50) NOT NULL,
          email_verified BOOLEAN DEFAULT FALSE,
          customer_type VARCHAR(50) DEFAULT 'INDIVIDUAL',
          admin_role VARCHAR(100) DEFAULT 'SUPER_ADMIN'
        );

        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          date VARCHAR(50),
          products TEXT NOT NULL,
          status VARCHAR(50) NOT NULL,
          amount VARCHAR(50) NOT NULL,
          gst_number VARCHAR(50),
          payment_method VARCHAR(50) NOT NULL,
          points_earned INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS otps (
          id VARCHAR(50) PRIMARY KEY,
          user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          otp_hash VARCHAR(256) NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          attempts INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          icon VARCHAR(50) NOT NULL,
          count VARCHAR(50),
          href VARCHAR(100)
        );

        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(100) PRIMARY KEY,
          value TEXT
        );

        CREATE TABLE IF NOT EXISTS search_queries (
          id SERIAL PRIMARY KEY,
          query VARCHAR(255) NOT NULL,
          results_count INTEGER NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS search_clicks (
          id SERIAL PRIMARY KEY,
          query VARCHAR(255) NOT NULL,
          product_id VARCHAR(50) NOT NULL,
          timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Run migrations for alters & constraints
      await runMigrations(pgPool);

      // Seed settings
      const settingsToSeed = [
        { key: 'b2c_minimum_order_value', value: '1000' },
        { key: 'default_gst_rate', value: '18' },
        { key: 'free_shipping_threshold', value: '5000' },
        { key: 'default_moq', value: '1' },
        { key: 'default_order_multiple', value: '1' },
        { key: 'rfq_auto_assignment', value: 'Unassigned' },
        { key: 'rfq_notifications', value: 'true' },
        { key: 'quote_validity_days', value: '30' },
        { key: 'search_enable_logging', value: 'true' },
        { key: 'notification_email_alerts', value: 'true' }
      ];
      for (const setting of settingsToSeed) {
        await pgPool.query(`
          INSERT INTO settings (key, value) VALUES ($1, $2)
          ON CONFLICT (key) DO NOTHING;
        `, [setting.key, setting.value]);
      }

      // Seed brands
      const defaultBrands = [
        { id: 'astral', name: 'Astral', logo: '/brands_astral.png', description: 'Pipes & Fittings', status: 'ACTIVE' },
        { id: 'finolex', name: 'Finolex', logo: '/brands_finolex.png', description: 'Wires & Cables', status: 'ACTIVE' },
        { id: 'havells', name: 'Havells', logo: '/brands_havells.png', description: 'Electrical & Lighting', status: 'ACTIVE' },
        { id: 'ultratech', name: 'UltraTech', logo: '/brands_ultratech.png', description: 'Cement & Concrete', status: 'ACTIVE' },
        { id: 'jsw', name: 'JSW', logo: '/brands_jsw.png', description: 'Steel & Structural', status: 'ACTIVE' }
      ];
      for (const brand of defaultBrands) {
        await pgPool.query(`
          INSERT INTO brands (id, name, logo, description, status)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING;
        `, [brand.id, brand.name, brand.logo, brand.description, brand.status]);
      }

      // Seed categories
      for (const cat of defaultCategories) {
        await pgPool.query(`
          INSERT INTO categories (id, name, icon, count, href)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (id) DO NOTHING;
        `, [cat.id, cat.name, cat.icon, cat.count || null, cat.href || null]);
      }

      // Seed products if table is empty or outdated
      const prodCountRes = await pgPool.query('SELECT COUNT(*) FROM products');
      const prodCount = parseInt(prodCountRes.rows[0].count, 10);
      if (prodCount < defaultProducts.length) {
        console.log('🌱 Seeding initial products into PostgreSQL (cleaning old ones)...');
        await pgPool.query('DELETE FROM products');
        for (let i = 0; i < defaultProducts.length; i++) {
          const rawProd = defaultProducts[i];
          const p = normalizeProductForSeeding(rawProd, i);
          await pgPool.query(`
            INSERT INTO products (
              id, category_title, name, unit, rating, icon, link, description, 
              specifications, recommended_accessories, subcategory_slug, leaf_slug,
              minimum_order_unit, order_multiple, allow_b2b, allow_b2c, minimum_order_quantity,
              product_id, sku, brand, model, unit_of_measure, hsn_code, gst_rate, 
              lead_time_days, status, category_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27)
          `, [
            p.id,
            p.categoryTitle || p.categoryId,
            p.name,
            p.unit || `/ ${p.unitOfMeasure}`,
            p.rating || '4.5',
            p.icon || 'inventory_2',
            p.link || null,
            p.description || null,
            JSON.stringify(p.specifications || {}),
            JSON.stringify(p.recommendedAccessories || []),
            p.subcategorySlug || null,
            p.leafSlug || null,
            p.minimumOrderUnit,
            p.orderMultiple,
            p.allowB2B,
            p.allowB2C,
            p.minimumOrderQuantity,
            p.productId,
            p.sku,
            p.brand,
            p.model,
            p.unitOfMeasure,
            p.hsnCode || null,
            p.gstRate,
            p.leadTimeDays,
            p.status,
            p.categoryId
          ]);

          // Seed product_variants directly
          const sku = p.sku || `SKU-${p.id.toUpperCase()}`;
          const price = p.price;
          const status = p.status || 'ACTIVE';
          await pgPool.query(`
            INSERT INTO product_variants (id, product_id, sku, name, attributes, price, unit_of_measure, minimum_order_quantity, order_multiple, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (id) DO NOTHING
          `, [p.id, p.id, sku, p.name, JSON.stringify(p.specifications || {}), price, p.unitOfMeasure || 'Piece', p.minimumOrderQuantity, p.orderMultiple, status]);

          // Seed inventory directly
          const available = p.inventory?.available !== undefined ? p.inventory.available : 100;
          await pgPool.query(`
            INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
            VALUES ($1, $2, 0, 10)
            ON CONFLICT (variant_id) DO NOTHING
          `, [p.id, available]);

          // Seed price tiers directly
          if (p.priceTiers && p.priceTiers.length > 0) {
            for (const tier of p.priceTiers) {
              await pgPool.query(`
                INSERT INTO product_price_tiers (variant_id, min_quantity, max_quantity, price, discount_percentage)
                VALUES ($1, $2, $3, $4, $5)
              `, [p.id, tier.min, tier.max, tier.price, tier.save || 0]);
            }
          }

          // Seed images directly
          if (p.images && p.images.length > 0) {
            for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
              await pgPool.query(`
                INSERT INTO product_images (product_id, image_url, display_order, is_primary)
                VALUES ($1, $2, $3, $4)
              `, [p.id, p.images[imgIdx], imgIdx, imgIdx === 0]);
            }
          }

          // Seed reviews directly
          if (p.reviews && p.reviews.length > 0) {
            for (const r of p.reviews) {
              await pgPool.query(`
                INSERT INTO product_reviews (product_id, reviewer_name, reviewer_role, rating, comment, is_verified_purchase, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
              `, [p.id, r.reviewerName || 'Anonymous', r.reviewerRole || 'Customer', r.rating || 5, r.comment || '', r.isVerifiedPurchase || false, r.status || 'APPROVED']);
            }
          }
        }
        console.log(`✅ Seeded ${defaultProducts.length} products successfully.`);
      }
    } catch (err: any) {
      console.warn('❌ Failed to connect to PostgreSQL. Falling back to local JSON database.', err.message);
      setUsePostgres(false);
    }
  } else {
    console.log('ℹ️ No DATABASE_URL environment variable found. Operating in local JSON fallback mode.');
    setUsePostgres(false);
  }

  // Seed JSON file if empty or outdated
  if (!usePostgres) {
    try {
      const db = await readJsonDb();
      const needsReseed = !db.products || db.products.length < defaultProducts.length || db.products.some((p: any) => !p.description);
      if (needsReseed) {
        console.log('🌱 Seeding initial detailed products into local JSON database...');
        db.products = defaultProducts.map((p, i) => {
          return normalizeProductForSeeding(p, i);
        });
        await writeJsonDb(db);
        console.log(`✅ Seeded ${defaultProducts.length} products with details into local JSON database successfully.`);
      }
    } catch (e: any) {
      console.warn('❌ Error seeding local JSON database:', e.message);
    }
  }
}

// Invoke DB startup
initDb();
// Trigger nodemon reload for postgres connection
