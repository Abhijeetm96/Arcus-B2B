/**
 * @file InventoryService.ts
 * @description Provides business operations for Available/Reserved stock metrics and lifecycle actions.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { getProductById, mapRowToProduct } from '../catalog/ProductService';
import { Product } from '../catalog/Product';
import { InventoryAdjustment } from './Inventory';

/**
 * Directly updates a product's available stock level (also updates legacy stock field).
 * 
 * @param {string} id - Product ID.
 * @param {number} stock - Total available stock units.
 * @returns {Promise<Product | null>} The updated product, or null if not found.
 */
export async function updateProductStock(id: string, stock: number): Promise<Product | null> {
  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(`
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
        VALUES ($1, $2, 0, 10)
        ON CONFLICT (variant_id) DO UPDATE SET available_stock = EXCLUDED.available_stock
      `, [id, stock]);
      
      await client.query('COMMIT');
      return await getProductById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.inventory) db.inventory = [];
    const invIdx = db.inventory.findIndex((iv: any) => iv.variantId === id);
    if (invIdx !== -1) {
      db.inventory[invIdx].availableStock = stock;
    } else {
      db.inventory.push({ variantId: id, availableStock: stock, reservedStock: 0, reorderLevel: 10 });
    }
    
    if (db.products) {
      const idx = db.products.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        delete db.products[idx].stock;
        delete db.products[idx].inventory_available;
        delete db.products[idx].inventory_reserved;
        delete db.products[idx].inventory_reorder_level;
        delete db.products[idx].inventory;
      }
    }
    await writeJsonDb(db);
    return await getProductById(id);
  }
}

/**
 * Directly updates all stock metrics for a product.
 * 
 * @param {string} id - Product ID.
 * @param {number} available - Quantity currently available for purchase.
 * @param {number} reserved - Quantity committed/reserved for active checkouts.
 * @param {number} reorderLevel - Reorder threshold.
 * @returns {Promise<Product | null>} The updated product, or null if not found.
 */
export async function updateProductInventory(
  id: string,
  available: number,
  reserved: number,
  reorderLevel: number
): Promise<Product | null> {
  if (usePostgres && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(`
        INSERT INTO inventory (variant_id, available_stock, reserved_stock, reorder_level)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (variant_id) DO UPDATE SET 
          available_stock = EXCLUDED.available_stock, 
          reserved_stock = EXCLUDED.reserved_stock,
          reorder_level = EXCLUDED.reorder_level
      `, [id, available, reserved, reorderLevel]);
      
      await client.query('COMMIT');
      return await getProductById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = await readJsonDb();
    if (!db.inventory) db.inventory = [];
    const invIdx = db.inventory.findIndex((iv: any) => iv.variantId === id);
    const invData = { variantId: id, availableStock: available, reservedStock: reserved, reorderLevel };
    if (invIdx !== -1) {
      db.inventory[invIdx] = invData;
    } else {
      db.inventory.push(invData);
    }
    
    if (db.products) {
      const idx = db.products.findIndex((p: any) => p.id === id);
      if (idx !== -1) {
        delete db.products[idx].stock;
        delete db.products[idx].inventory_available;
        delete db.products[idx].inventory_reserved;
        delete db.products[idx].inventory_reorder_level;
        delete db.products[idx].inventory;
      }
    }
    await writeJsonDb(db);
    return await getProductById(id);
  }
}

/**
 * Checks if a product has sufficient available stock for a quantity purchase.
 * 
 * @param {string} productId - Product ID.
 * @param {number} quantity - Quantity desired.
 * @returns {Promise<boolean>} True if available stock >= quantity, false otherwise.
 */
export async function checkAvailability(productId: string, quantity: number): Promise<boolean> {
  const product = await getProductById(productId);
  if (!product) return false;
  const available = product.inventory?.available ?? product.stock ?? 100;
  return available >= quantity;
}

/**
 * Reserves stock upon order placement: decreases available stock and increases reserved stock.
 * Throws an error if stock is insufficient.
 * 
 * @param {string} productId - Product ID.
 * @param {number} quantity - Quantity to reserve.
 * @returns {Promise<void>}
 */
export async function reserveStock(productId: string, quantity: number): Promise<void> {
  const product = await getProductById(productId);
  if (!product) throw new Error(`Product ${productId} not found.`);
  const available = product.inventory?.available ?? product.stock ?? 100;
  const reserved = product.inventory?.reserved ?? 0;
  const reorderLevel = product.inventory?.reorderLevel ?? 10;
  
  if (available < quantity) {
    throw new Error(`Insufficient stock for ${product.name}.`);
  }
  
  await updateProductInventory(productId, available - quantity, reserved + quantity, reorderLevel);
}

/**
 * Releases reserved stock.
 * If order is Cancelled: returns items to available stock (+available, -reserved).
 * If order is Fulfilled: finishes reservation lifecycle by removing from reserved stock (-reserved).
 * 
 * @param {string} productId - Product ID.
 * @param {number} quantity - Quantity of stock to release.
 * @param {'Fulfilled' | 'Cancelled'} orderStatus - The action triggering the release.
 * @returns {Promise<void>}
 */
export async function releaseStock(productId: string, quantity: number, orderStatus: 'Fulfilled' | 'Cancelled'): Promise<void> {
  const product = await getProductById(productId);
  if (!product) throw new Error(`Product ${productId} not found.`);
  const available = product.inventory?.available ?? product.stock ?? 100;
  const reserved = product.inventory?.reserved ?? 0;
  const reorderLevel = product.inventory?.reorderLevel ?? 10;

  if (orderStatus === 'Cancelled') {
    await updateProductInventory(productId, available + quantity, Math.max(0, reserved - quantity), reorderLevel);
  } else {
    // Fulfilled (Delivered, Dispatched, Confirmed etc) - deduct from reserved
    await updateProductInventory(productId, available, Math.max(0, reserved - quantity), reorderLevel);
  }
}

/**
 * Evaluates whether a product's available stock is at or below its reorder level.
 * 
 * @param {Product} product - Product instance to check.
 * @returns {boolean} True if stock level is low, false otherwise.
 */
export function reorderChecks(product: Product): boolean {
  const available = product.inventory?.available ?? product.stock ?? 100;
  const reorderLevel = product.inventory?.reorderLevel ?? 10;
  return available <= reorderLevel;
}

/**
 * Records an inventory adjustment in database logs.
 */
export async function recordAdjustment(
  productId: string,
  adjustmentType: string,
  quantity: number,
  previousStock: number,
  newStock: number,
  reason: string,
  performedBy: string
): Promise<InventoryAdjustment> {
  const timestamp = new Date().toISOString();
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `INSERT INTO inventory_adjustments (product_id, adjustment_type, quantity, previous_stock, new_stock, reason, performed_by, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [productId, adjustmentType, quantity, previousStock, newStock, reason, performedBy, timestamp]
    );
    const r = res.rows[0];
    return {
      id: r.id,
      productId: r.product_id,
      adjustmentType: r.adjustment_type,
      quantity: r.quantity,
      previousStock: r.previous_stock,
      newStock: r.new_stock,
      reason: r.reason || undefined,
      performedBy: r.performed_by,
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : new Date(r.timestamp).toISOString()
    };
  } else {
    const db = await readJsonDb();
    if (!db.inventoryAdjustments) db.inventoryAdjustments = [];
    const adj: InventoryAdjustment = {
      id: db.inventoryAdjustments.length + 1,
      productId,
      adjustmentType,
      quantity,
      previousStock,
      newStock,
      reason,
      performedBy,
      timestamp
    };
    db.inventoryAdjustments.push(adj);
    await writeJsonDb(db);
    return adj;
  }
}

/**
 * Fetches inventory adjustments history, optionally filtered by productId.
 */
export async function getAdjustmentHistory(productId?: string): Promise<InventoryAdjustment[]> {
  if (usePostgres && pgPool) {
    let query = "SELECT * FROM inventory_adjustments";
    const values: any[] = [];
    if (productId) {
      query += " WHERE product_id = $1";
      values.push(productId);
    }
    query += " ORDER BY timestamp DESC";
    const res = await pgPool.query(query, values);
    return res.rows.map(r => ({
      id: r.id,
      productId: r.product_id,
      adjustmentType: r.adjustment_type,
      quantity: r.quantity,
      previousStock: r.previous_stock,
      newStock: r.new_stock,
      reason: r.reason || undefined,
      performedBy: r.performed_by,
      timestamp: r.timestamp instanceof Date ? r.timestamp.toISOString() : new Date(r.timestamp).toISOString()
    }));
  } else {
    const db = await readJsonDb();
    let history = db.inventoryAdjustments || [];
    if (productId) {
      history = history.filter((h: any) => h.productId === productId);
    }
    return [...history].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }
}

