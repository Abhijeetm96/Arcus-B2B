/**
 * @file ProductService.ts
 * @description Provides business operations and query helpers for products.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Product } from './Product';

/**
 * Helper to enrich local JSON DB product record with normalized tables.
 * Construct a clean object containing only non-legacy fields plus the normalized ones.
 */
function enrichProductWithNormalized(p: any, db: any, caller: string): any {
  if (!p) return null;
  const variant = db.product_variants?.find((v: any) => v.productId === p.id || v.id === p.id);
  const inv = db.inventory?.find((i: any) => i.variantId === (variant?.id || p.id));
  const rawTiers = db.product_price_tiers?.filter((t: any) => t.variantId === (variant?.id || p.id)) || [];
  const uniqueTiersMap = new Map<string, any>();
  rawTiers.forEach((t: any) => {
    const key = `${t.minQuantity || t.min}_${t.maxQuantity || t.max}_${t.price}`;
    uniqueTiersMap.set(key, t);
  });
  const tiers = Array.from(uniqueTiersMap.values());
  const images = db.product_images?.filter((img: any) => img.productId === p.id) || [];
  const reviews = db.product_reviews?.filter((r: any) => r.productId === p.id) || [];


  let resolvedUom = variant?.unitOfMeasure;
  if (!resolvedUom && p.unit) {
    resolvedUom = p.unit.replace(/^\/\s*/, '');
  }
  if (!resolvedUom) {
    resolvedUom = p.unitOfMeasure || 'Piece';
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description || undefined,
    category_id: p.categoryId || p.category_id || 'materials',
    subcategory_slug: p.subcategorySlug || p.subcategory_slug || undefined,
    leaf_slug: p.leafSlug || p.leaf_slug || undefined,
    unit: p.unit || p.unitOfMeasure || 'Piece',
    hsn_code: p.hsnCode || p.hsn_code || undefined,
    gst_rate: p.gstRate !== undefined ? p.gstRate : (p.gst_rate !== undefined ? p.gst_rate : 18),
    specifications: p.specifications || {},
    recommended_accessories: p.recommendedAccessories || p.recommended_accessories || [],
    brand: p.brand || '',
    model: p.model || p.name || '',
    unit_of_measure: resolvedUom,
    minimum_order_quantity: variant?.minimumOrderQuantity !== undefined ? variant.minimumOrderQuantity : p.minimum_order_quantity,
    order_multiple: variant?.orderMultiple !== undefined ? variant.orderMultiple : p.order_multiple,
    status: variant?.status || p.status || 'ACTIVE',
    procurement_price: p.procurementPrice || p.procurement_price,
    vendor_name: p.vendorName || p.vendor_name,
    vendor_product_code: p.vendorProductCode || p.vendor_product_code,

    variant_price: variant?.price,
    variant_stock: inv?.availableStock,
    inventory_available: inv?.availableStock,
    inventory_reserved: inv?.reservedStock,
    inventory_reorder_level: inv?.reorderLevel,
    variant_price_tiers: tiers.map((t: any) => ({
      min: t.minQuantity,
      max: t.maxQuantity,
      price: t.price,
      save: t.discountPercentage
    })),
    variant_images: images.length > 0 ? images.sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0)).map((img: any) => img.imageUrl) : undefined,
    variant_reviews: reviews.length > 0 ? reviews.map((r: any) => ({
      id: r.id,
      reviewerName: r.reviewerName || r.reviewer_name,
      reviewerRole: r.reviewerRole || r.reviewer_role,
      rating: r.rating,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase !== undefined ? r.isVerifiedPurchase : r.is_verified_purchase,
      status: r.status,
      createdAt: r.createdAt || r.created_at
    })) : undefined
  };
}

/**
 * Deserializes database rows into standardized client-compatible Product schema mappings,
 * ensuring complete fallback support for legacy database schemas.
 * 
 * @param {any} row - The raw product row returned from a SQL query or JSON record.
 * @returns {Product} The standardized Product instance.
 */
export function mapRowToProduct(row: any, caller = 'ProductService'): Product {
  if (!row) return null as any;


  const id = row.id;

  // 1. Price from variant
  const priceVal = row.variant_price !== undefined && row.variant_price !== null ? parseFloat(row.variant_price) : 0;

  // 2. Stock & Inventory from inventory table
  const available = row.variant_stock !== undefined && row.variant_stock !== null ? parseInt(row.variant_stock, 10) : 100;
  const reserved = row.inventory_reserved !== undefined && row.inventory_reserved !== null ? parseInt(row.inventory_reserved, 10) : 0;
  const reorderLevel = row.inventory_reorder_level !== undefined && row.inventory_reorder_level !== null ? parseInt(row.inventory_reorder_level, 10) : 10;
  
  // 3. Price Tiers from product_price_tiers
  let priceTiers = [];
  if (row.variant_price_tiers !== undefined && row.variant_price_tiers !== null) {
    priceTiers = typeof row.variant_price_tiers === 'string' ? JSON.parse(row.variant_price_tiers) : row.variant_price_tiers;
  }

  // 4. Images from product_images
  let images = [];
  if (row.variant_images !== undefined && row.variant_images !== null) {
    images = typeof row.variant_images === 'string' ? JSON.parse(row.variant_images) : row.variant_images;
  }

  // 5. Reviews from product_reviews
  let reviews = [];
  if (row.variant_reviews !== undefined && row.variant_reviews !== null) {
    reviews = typeof row.variant_reviews === 'string' ? JSON.parse(row.variant_reviews) : row.variant_reviews;
  }

  const specifications = typeof row.specifications === 'string' ? JSON.parse(row.specifications) : (row.specifications || {});
  const recommendedAccessories = typeof row.recommended_accessories === 'string' ? JSON.parse(row.recommended_accessories) : (row.recommended_accessories || []);

  let brand = row.brand || '';
  if (!brand && row.name) {
    const parts = row.name.split(' ');
    brand = parts[0] || 'ARCUS';
  }
  const model = row.model || row.name || '';

  return {
    id: row.id,
    productId: row.product_id || row.id,
    sku: row.sku || `SKU-${row.id.toUpperCase()}`,
    brand: brand,
    model: model,
    name: row.name,
    description: row.description || undefined,
    categoryId: row.category_id || (row.category_title ? row.category_title.toLowerCase() : 'materials'),
    subcategorySlug: row.subcategory_slug || undefined,
    leafSlug: row.leaf_slug || undefined,
    price: priceVal,
    unitOfMeasure: row.unit_of_measure || row.unit || 'Piece',
    hsnCode: row.hsn_code || undefined,
    gstRate: row.gst_rate !== undefined ? parseFloat(row.gst_rate) : 18,
    inventory: {
      available,
      reserved,
      reorderLevel
    },
    minimumOrderQuantity: row.minimum_order_quantity !== undefined ? row.minimum_order_quantity : 1,
    minimumOrderUnit: row.minimum_order_unit || row.unit || 'Piece',
    orderMultiple: row.order_multiple !== undefined ? row.order_multiple : 1,
    allowB2B: row.allow_b2b !== undefined ? row.allow_b2b : true,
    allowB2C: row.allow_b2c !== undefined ? row.allow_b2c : true,
    leadTimeDays: row.lead_time_days !== undefined ? row.lead_time_days : 3,
    status: row.status || 'ACTIVE',
    specifications,
    images,
    priceTiers,
    recommendedAccessories,
    reviews,
    
    // Legacy fields mapped from variant/inventory for 100% API compatibility
    categoryTitle: row.category_title || row.category_id || 'Materials',
    unit: row.unit || row.unit_of_measure || 'Piece',
    stock: available,
    link: row.link || `#/product/${row.id}`,
    icon: row.icon || 'inventory_2',
    rating: row.rating !== undefined ? String(row.rating) : '4.5',
    procurementPrice: row.procurement_price !== undefined ? parseFloat(row.procurement_price) : undefined,
    vendorName: row.vendor_name || undefined,
    vendorProductCode: row.vendor_product_code || undefined
  };
}

/**
 * Retrieves the full product catalog array.
 * @returns {Promise<Product[]>} Array of products.
 */
export async function getAllProducts(): Promise<Product[]> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT DISTINCT ON (p.id) p.id, p.category_title, p.name, p.unit, p.rating, p.icon, p.link, p.description,
             p.specifications, p.recommended_accessories, p.subcategory_slug, p.leaf_slug, p.status, p.category_id,
             v.sku, v.name AS variant_name, v.price AS variant_price, v.unit_of_measure, v.minimum_order_quantity, v.order_multiple, v.status AS variant_status,
             v.procurement_price,
             inv.available_stock AS variant_stock, inv.reserved_stock AS inventory_reserved, inv.reorder_level AS inventory_reorder_level,
             (
                 SELECT COALESCE(json_agg(json_build_object(
                     'min', pt.min_quantity,
                     'max', pt.max_quantity,
                     'price', pt.price,
                     'save', pt.discount_percentage
                 ) ORDER BY pt.min_quantity), '[]'::json)
                 FROM (
                     SELECT DISTINCT min_quantity, max_quantity, price, discount_percentage, variant_id
                     FROM product_price_tiers
                 ) pt
                 WHERE pt.variant_id = v.id
             ) AS variant_price_tiers,
             (
                 SELECT COALESCE(json_agg(img.image_url ORDER BY img.display_order), '[]'::json)
                 FROM product_images img
                 WHERE img.product_id = p.id
             ) AS variant_images,
             (
                 SELECT COALESCE(json_agg(json_build_object(
                     'id', r.id,
                     'reviewerName', r.reviewer_name,
                     'reviewerRole', r.reviewer_role,
                     'rating', r.rating,
                     'comment', r.comment,
                     'isVerifiedPurchase', r.is_verified_purchase,
                     'status', r.status,
                     'createdAt', r.created_at
                 ) ORDER BY r.created_at DESC), '[]'::json)
                 FROM product_reviews r
                 WHERE r.product_id = p.id
             ) AS variant_reviews
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      LEFT JOIN inventory inv ON v.id = inv.variant_id
      ORDER BY p.id
    `;
    const res = await pgPool.query(query);
    return res.rows.map(row => mapRowToProduct(row, 'getAllProducts'));
  } else {
    const db = await readJsonDb();
    const list = db.products || [];
    return list.map((p: any) => mapRowToProduct(enrichProductWithNormalized(p, db, 'getAllProducts'), 'getAllProducts'));
  }
}

/**
 * Retrieves a single product by its unique identifier.
 * @param {string} id - Unique product ID.
 * @returns {Promise<Product | null>} The product object if found, otherwise null.
 */
export async function getProductById(id: string): Promise<Product | null> {
  if (usePostgres && pgPool) {
    const query = `
      SELECT DISTINCT ON (p.id) p.id, p.category_title, p.name, p.unit, p.rating, p.icon, p.link, p.description,
             p.specifications, p.recommended_accessories, p.subcategory_slug, p.leaf_slug, p.status, p.category_id,
             v.sku, v.name AS variant_name, v.price AS variant_price, v.unit_of_measure, v.minimum_order_quantity, v.order_multiple, v.status AS variant_status,
             v.procurement_price,
             inv.available_stock AS variant_stock, inv.reserved_stock AS inventory_reserved, inv.reorder_level AS inventory_reorder_level,
             (
                 SELECT COALESCE(json_agg(json_build_object(
                     'min', pt.min_quantity,
                     'max', pt.max_quantity,
                     'price', pt.price,
                     'save', pt.discount_percentage
                 ) ORDER BY pt.min_quantity), '[]'::json)
                 FROM (
                     SELECT DISTINCT min_quantity, max_quantity, price, discount_percentage, variant_id
                     FROM product_price_tiers
                 ) pt
                 WHERE pt.variant_id = v.id
             ) AS variant_price_tiers,
             (
                 SELECT COALESCE(json_agg(img.image_url ORDER BY img.display_order), '[]'::json)
                 FROM product_images img
                 WHERE img.product_id = p.id
             ) AS variant_images,
             (
                 SELECT COALESCE(json_agg(json_build_object(
                     'id', r.id,
                     'reviewerName', r.reviewer_name,
                     'reviewerRole', r.reviewer_role,
                     'rating', r.rating,
                     'comment', r.comment,
                     'isVerifiedPurchase', r.is_verified_purchase,
                     'status', r.status,
                     'createdAt', r.created_at
                 ) ORDER BY r.created_at DESC), '[]'::json)
                 FROM product_reviews r
                 WHERE r.product_id = p.id
             ) AS variant_reviews
      FROM products p
      LEFT JOIN product_variants v ON p.id = v.product_id
      LEFT JOIN inventory inv ON v.id = inv.variant_id
      WHERE p.id = $1
    `;
    const res = await pgPool.query(query, [id]);
    if (res.rows.length === 0) return null;
    return mapRowToProduct(res.rows[0], 'getProductById');
  } else {
    const db = await readJsonDb();
    const product = db.products?.find((p: any) => p.id === id);
    if (!product) return null;
    return mapRowToProduct(enrichProductWithNormalized(product, db, 'getProductById'), 'getProductById');
  }
}

/**
 * Registers a new product in the active catalog.
 * @param {Product} p - Product properties to create.
 * @returns {Promise<Product>} Resolves with the registered Product.
 */
export async function addProduct(p: Product): Promise<Product> {


  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        INSERT INTO products (
          id, category_title, name, unit, rating, icon, link, description,
          specifications, recommended_accessories, subcategory_slug, leaf_slug,
          product_id, sku, brand, model, unit_of_measure, hsn_code, gst_rate,
          minimum_order_quantity, minimum_order_unit, order_multiple, allow_b2b,
          allow_b2c, lead_time_days, status, category_id, procurement_price,
          vendor_name, vendor_product_code
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
      `;
      const values = [
        p.id,
        p.categoryTitle || p.categoryId,
        p.name,
        p.unit || p.unitOfMeasure,
        p.rating || '4.5',
        p.icon || 'inventory_2',
        p.link || `#/product/${p.id}`,
        p.description || null,
        JSON.stringify(p.specifications || {}),
        JSON.stringify(p.recommendedAccessories || []),
        p.subcategorySlug || null,
        p.leafSlug || null,
        p.productId || p.id,
        p.sku || `SKU-${p.id.toUpperCase()}`,
        p.brand,
        p.model,
        p.unitOfMeasure,
        p.hsnCode || null,
        p.gstRate !== undefined ? p.gstRate : 18,
        p.minimumOrderQuantity,
        p.minimumOrderUnit,
        p.orderMultiple !== undefined ? p.orderMultiple : 1,
        p.allowB2B,
        p.allowB2C,
        p.leadTimeDays !== undefined ? p.leadTimeDays : 3,
        p.status || 'ACTIVE',
        p.categoryId,
        p.procurementPrice !== undefined ? p.procurementPrice : null,
        p.vendorName || null,
        p.vendorProductCode || null
      ];
      await client.query(query, values);

      // Insert product_variants
      const sku = p.sku || `SKU-${p.id.toUpperCase()}`;
      const available = p.inventory?.available !== undefined ? p.inventory.available : 100;
      const reserved = p.inventory?.reserved !== undefined ? p.inventory.reserved : 0;
      const reorderLevel = p.inventory?.reorderLevel !== undefined ? p.inventory.reorderLevel : 10;
      const moq = p.minimumOrderQuantity !== undefined ? p.minimumOrderQuantity : 1;
      const ordMult = p.orderMultiple !== undefined ? p.orderMultiple : 1;
      const status = p.status || 'ACTIVE';

      await client.query(`
        INSERT INTO product_variants (id, product_id, sku, name, attributes, price, unit_of_measure, minimum_order_quantity, order_multiple, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET 
          sku = EXCLUDED.sku, name = EXCLUDED.name, attributes = EXCLUDED.attributes,
          price = EXCLUDED.price, unit_of_measure = EXCLUDED.unit_of_measure,
          minimum_order_quantity = EXCLUDED.minimum_order_quantity, order_multiple = EXCLUDED.order_multiple,
          status = EXCLUDED.status
      `, [p.id, p.id, sku, p.name, JSON.stringify(p.specifications || {}), p.price, p.unitOfMeasure || p.unit || 'Piece', moq, ordMult, status]);

      // Insert inventory
      await client.query(`
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (variant_id) DO UPDATE SET
          available_stock = EXCLUDED.available_stock, reserved_stock = EXCLUDED.reserved_stock,
          reorder_level = EXCLUDED.reorder_level
      `, [p.id, available, reserved, reorderLevel]);

      // Price Tiers sync
      if (p.priceTiers && p.priceTiers.length > 0) {
        await client.query('DELETE FROM product_price_tiers WHERE variant_id = $1', [p.id]);
        for (const tier of p.priceTiers) {
          await client.query(`
            INSERT INTO product_price_tiers (variant_id, min_quantity, max_quantity, price, discount_percentage)
            VALUES ($1, $2, $3, $4, $5)
          `, [p.id, tier.min, tier.max, tier.price, tier.save || 0]);
        }
      }

      // Images sync
      if (p.images && p.images.length > 0) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [p.id]);
        for (let i = 0; i < p.images.length; i++) {
          await client.query(`
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
            VALUES ($1, $2, $3, $4)
          `, [p.id, p.images[i], i, i === 0]);
        }
      }

      // Reviews sync
      if (p.reviews && p.reviews.length > 0) {
        await client.query('DELETE FROM product_reviews WHERE product_id = $1', [p.id]);
        for (const r of p.reviews) {
          await client.query(`
            INSERT INTO product_reviews (product_id, reviewer_name, reviewer_role, rating, comment, is_verified_purchase, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [p.id, r.reviewerName || 'Anonymous', r.reviewerRole || 'Customer', r.rating || 5, r.comment || '', r.isVerifiedPurchase || false, r.status || 'APPROVED']);
        }
      }

      await client.query('COMMIT');
      return p;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.products) db.products = [];

    // Strip legacy fields from products array
    const cleanProduct = { ...p };
    const legacyKeys = ['price', 'stock', 'priceTiers', 'price_tiers', 'images', 'reviews', 'inventory_available', 'inventory_reserved', 'inventory_reorder_level'];
    for (const key of legacyKeys) {
      delete (cleanProduct as any)[key];
    }
    db.products.push(cleanProduct);

    if (!db.product_variants) db.product_variants = [];
    if (!db.inventory) db.inventory = [];
    if (!db.product_price_tiers) db.product_price_tiers = [];
    if (!db.product_images) db.product_images = [];
    if (!db.product_reviews) db.product_reviews = [];

    const available = p.inventory?.available !== undefined ? p.inventory.available : 100;
    const reserved = p.inventory?.reserved !== undefined ? p.inventory.reserved : 0;
    const reorderLevel = p.inventory?.reorderLevel !== undefined ? p.inventory.reorderLevel : 10;

    db.product_variants.push({
      id: p.id,
      productId: p.id,
      sku: p.sku || `SKU-${p.id.toUpperCase()}`,
      name: p.name,
      attributes: p.specifications || {},
      price: p.price,
      unitOfMeasure: p.unitOfMeasure || p.unit || 'Piece',
      minimumOrderQuantity: p.minimumOrderQuantity || 1,
      orderMultiple: p.orderMultiple || 1,
      status: p.status || 'ACTIVE'
    });

    db.inventory.push({
      variantId: p.id,
      availableStock: available,
      reservedStock: reserved,
      reorderLevel
    });

    if (p.priceTiers) {
      p.priceTiers.forEach((t: any) => {
        db.product_price_tiers.push({
          variantId: p.id,
          minQuantity: t.min,
          maxQuantity: t.max,
          price: t.price,
          discountPercentage: t.save || 0
        });
      });
    }

    if (p.images) {
      p.images.forEach((img: any, idx: number) => {
        db.product_images.push({
          productId: p.id,
          imageUrl: img,
          displayOrder: idx,
          isPrimary: idx === 0
        });
      });
    }

    if (p.reviews) {
      p.reviews.forEach((r: any) => {
        db.product_reviews.push({
          id: r.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          productId: p.id,
          reviewerName: r.reviewerName || 'Anonymous',
          reviewerRole: r.reviewerRole || 'Customer',
          rating: r.rating || 5,
          comment: r.comment || '',
          isVerifiedPurchase: r.isVerifiedPurchase || false,
          status: r.status || 'APPROVED'
        });
      });
    }

    await writeJsonDb(db);
    return p;
  }
}

/**
 * Updates properties of an existing product.
 * @param {Product} p - The product data to update (identifies product by p.id).
 * @returns {Promise<Product | null>} Resolves with the updated product, or null if not found.
 */
export async function updateProduct(p: Product): Promise<Product | null> {


  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      const query = `
        UPDATE products SET
          category_title = $1, name = $2, unit = $3, rating = $4,
          icon = $5, link = $6, description = $7, specifications = $8,
          recommended_accessories = $9, subcategory_slug = $10, leaf_slug = $11,
          product_id = $12, sku = $13, brand = $14, model = $15,
          unit_of_measure = $16, hsn_code = $17, gst_rate = $18,
          minimum_order_quantity = $19, minimum_order_unit = $20,
          order_multiple = $21, allow_b2b = $22, allow_b2c = $23,
          lead_time_days = $24, status = $25, category_id = $26,
          procurement_price = $27, vendor_name = $28, vendor_product_code = $29
        WHERE id = $30 RETURNING id
      `;
      const values = [
        p.categoryTitle || p.categoryId,
        p.name,
        p.unit || p.unitOfMeasure,
        p.rating || '4.5',
        p.icon || 'inventory_2',
        p.link || `#/product/${p.id}`,
        p.description || null,
        JSON.stringify(p.specifications || {}),
        JSON.stringify(p.recommendedAccessories || []),
        p.subcategorySlug || null,
        p.leafSlug || null,
        p.productId || p.id,
        p.sku || `SKU-${p.id.toUpperCase()}`,
        p.brand,
        p.model,
        p.unitOfMeasure,
        p.hsnCode || null,
        p.gstRate !== undefined ? p.gstRate : 18,
        p.minimumOrderQuantity,
        p.minimumOrderUnit,
        p.orderMultiple !== undefined ? p.orderMultiple : 1,
        p.allowB2B,
        p.allowB2C,
        p.leadTimeDays !== undefined ? p.leadTimeDays : 3,
        p.status || 'ACTIVE',
        p.categoryId,
        p.procurementPrice !== undefined ? p.procurementPrice : null,
        p.vendorName || null,
        p.vendorProductCode || null,
        p.id
      ];
      const res = await client.query(query, values);
      if (res.rows.length === 0) {
        await client.query('ROLLBACK');
        return null;
      }

      // Upsert product_variants
      const sku = p.sku || `SKU-${p.id.toUpperCase()}`;
      const available = p.inventory?.available !== undefined ? p.inventory.available : 100;
      const reserved = p.inventory?.reserved !== undefined ? p.inventory.reserved : 0;
      const reorderLevel = p.inventory?.reorderLevel !== undefined ? p.inventory.reorderLevel : 10;
      const moq = p.minimumOrderQuantity !== undefined ? p.minimumOrderQuantity : 1;
      const ordMult = p.orderMultiple !== undefined ? p.orderMultiple : 1;
      const status = p.status || 'ACTIVE';

      await client.query(`
        INSERT INTO product_variants (id, product_id, sku, name, attributes, price, unit_of_measure, minimum_order_quantity, order_multiple, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET 
          sku = EXCLUDED.sku, name = EXCLUDED.name, attributes = EXCLUDED.attributes,
          price = EXCLUDED.price, unit_of_measure = EXCLUDED.unit_of_measure,
          minimum_order_quantity = EXCLUDED.minimum_order_quantity, order_multiple = EXCLUDED.order_multiple,
          status = EXCLUDED.status
      `, [p.id, p.id, sku, p.name, JSON.stringify(p.specifications || {}), p.price, p.unitOfMeasure || p.unit || 'Piece', moq, ordMult, status]);

      // Upsert inventory
      await client.query(`
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (variant_id) DO UPDATE SET
          available_stock = EXCLUDED.available_stock, reserved_stock = EXCLUDED.reserved_stock,
          reorder_level = EXCLUDED.reorder_level
      `, [p.id, available, reserved, reorderLevel]);

      // Price Tiers sync
      if (p.priceTiers) {
        await client.query('DELETE FROM product_price_tiers WHERE variant_id = $1', [p.id]);
        for (const tier of p.priceTiers) {
          await client.query(`
            INSERT INTO product_price_tiers (variant_id, min_quantity, max_quantity, price, discount_percentage)
            VALUES ($1, $2, $3, $4, $5)
          `, [p.id, tier.min, tier.max, tier.price, tier.save || 0]);
        }
      }

      // Images sync
      if (p.images) {
        await client.query('DELETE FROM product_images WHERE product_id = $1', [p.id]);
        for (let i = 0; i < p.images.length; i++) {
          await client.query(`
            INSERT INTO product_images (product_id, image_url, display_order, is_primary)
            VALUES ($1, $2, $3, $4)
          `, [p.id, p.images[i], i, i === 0]);
        }
      }

      // Reviews sync
      if (p.reviews) {
        await client.query('DELETE FROM product_reviews WHERE product_id = $1', [p.id]);
        for (const r of p.reviews) {
          await client.query(`
            INSERT INTO product_reviews (product_id, reviewer_name, reviewer_role, rating, comment, is_verified_purchase, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [p.id, r.reviewerName || 'Anonymous', r.reviewerRole || 'Customer', r.rating || 5, r.comment || '', r.isVerifiedPurchase || false, r.status || 'APPROVED']);
        }
      }

      await client.query('COMMIT');
      return p;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.products) return null;
    const idx = db.products.findIndex((pr: any) => pr.id === p.id);
    if (idx === -1) return null;

    // Strip legacy fields
    const cleanProduct = { ...p };
    const legacyKeys = ['price', 'stock', 'priceTiers', 'price_tiers', 'images', 'reviews', 'inventory_available', 'inventory_reserved', 'inventory_reorder_level'];
    for (const key of legacyKeys) {
      delete (cleanProduct as any)[key];
    }
    db.products[idx] = cleanProduct;

    // Sync arrays in JSON DB
    if (!db.product_variants) db.product_variants = [];
    if (!db.inventory) db.inventory = [];
    if (!db.product_price_tiers) db.product_price_tiers = [];
    if (!db.product_images) db.product_images = [];
    if (!db.product_reviews) db.product_reviews = [];

    const available = p.inventory?.available !== undefined ? p.inventory.available : 100;
    const reserved = p.inventory?.reserved !== undefined ? p.inventory.reserved : 0;
    const reorderLevel = p.inventory?.reorderLevel !== undefined ? p.inventory.reorderLevel : 10;

    // Update variant
    const varIdx = db.product_variants.findIndex((v: any) => v.id === p.id);
    const varData = {
      id: p.id,
      productId: p.id,
      sku: p.sku || `SKU-${p.id.toUpperCase()}`,
      name: p.name,
      attributes: p.specifications || {},
      price: p.price,
      unitOfMeasure: p.unitOfMeasure || p.unit || 'Piece',
      minimumOrderQuantity: p.minimumOrderQuantity || 1,
      orderMultiple: p.orderMultiple || 1,
      status: p.status || 'ACTIVE'
    };
    if (varIdx !== -1) db.product_variants[varIdx] = varData;
    else db.product_variants.push(varData);

    // Update inventory
    const invIdx = db.inventory.findIndex((inv: any) => inv.variantId === p.id);
    const invData = {
      variantId: p.id,
      availableStock: available,
      reservedStock: reserved,
      reorderLevel
    };
    if (invIdx !== -1) db.inventory[invIdx] = invData;
    else db.inventory.push(invData);

    if (p.priceTiers) {
      db.product_price_tiers = db.product_price_tiers.filter((t: any) => t.variantId !== p.id);
      p.priceTiers.forEach((t: any) => {
        db.product_price_tiers.push({
          variantId: p.id,
          minQuantity: t.min,
          maxQuantity: t.max,
          price: t.price,
          discountPercentage: t.save || 0
        });
      });
    }

    if (p.images) {
      db.product_images = db.product_images.filter((img: any) => img.productId !== p.id);
      p.images.forEach((img: any, idx: number) => {
        db.product_images.push({
          productId: p.id,
          imageUrl: img,
          displayOrder: idx,
          isPrimary: idx === 0
        });
      });
    }

    if (p.reviews) {
      db.product_reviews = db.product_reviews.filter((r: any) => r.productId !== p.id);
      p.reviews.forEach((r: any) => {
        db.product_reviews.push({
          id: r.id || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          productId: p.id,
          reviewerName: r.reviewerName || 'Anonymous',
          reviewerRole: r.reviewerRole || 'Customer',
          rating: r.rating || 5,
          comment: r.comment || '',
          isVerifiedPurchase: r.isVerifiedPurchase || false,
          status: r.status || 'APPROVED'
        });
      });
    }

    await writeJsonDb(db);
    return p;
  }
}

/**
 * Archives a product in the database catalog by setting status to 'ARCHIVED'.
 * @param {string} id - Product ID to archive.
 * @returns {Promise<boolean>} True if archived successfully, false otherwise.
 */
export async function deleteProduct(id: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("UPDATE products SET status = 'ARCHIVED' WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.products) return false;
    const idx = db.products.findIndex((pr: any) => pr.id === id);
    if (idx !== -1) {
      db.products[idx].status = 'ARCHIVED';
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}

