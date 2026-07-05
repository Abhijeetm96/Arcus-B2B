/**
 * @file CategoryService.ts
 * @description Provides business operations for managing product categories.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Category } from './Category';
import { defaultCategories } from '../../seed/categories';

/**
 * Retrieves all categories from the active database.
 * If fallback database is empty, seeds default categories.
 * 
 * @returns {Promise<Category[]>} Array of categories.
 */
export async function getAllCategories(): Promise<Category[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(`
      SELECT c.*, COUNT(p.id)::integer as dynamic_count 
      FROM categories c 
      LEFT JOIN products p ON p.category_id = c.id 
      GROUP BY c.id 
      ORDER BY c.id ASC
    `);
    return res.rows.map(row => ({
      id: row.id,
      name: row.name,
      icon: row.icon,
      count: `${row.dynamic_count || 0} products`,
      href: row.href || undefined,
      parentId: row.parent_id || undefined
    }));
  } else {
    const db = await readJsonDb();
    if (!db.categories) {
      db.categories = defaultCategories;
      await writeJsonDb(db);
    }
    const products = db.products || [];
    const counts = products.reduce((acc: Record<string, number>, p: any) => {
      if (p.categoryId) {
        acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      }
      return acc;
    }, {});
    return db.categories.map((c: any) => ({
      ...c,
      count: `${counts[c.id] || 0} products`
    }));
  }
}

/**
 * Registers a new category in the catalog.
 * 
 * @param {Category} category - Category data to insert.
 * @returns {Promise<Category>} The registered category.
 */
export async function addCategory(category: Category): Promise<Category> {
  if (usePostgres && pgPool) {
    await pgPool.query(
      "INSERT INTO categories (id, name, icon, count, href, parent_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [category.id, category.name, category.icon, category.count || null, category.href || null, category.parentId || null]
    );
    return category;
  } else {
    const db = await readJsonDb();
    if (!db.categories) db.categories = [];
    db.categories.push(category);
    await writeJsonDb(db);
    return category;
  }
}

/**
 * Updates an existing category by its ID.
 * 
 * @param {string} id - Unique identifier of the category to update.
 * @param {Category} category - The updated category details.
 * @returns {Promise<Category | null>} The updated category object, or null if not found.
 */
export async function updateCategory(id: string, category: Category): Promise<Category | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      "UPDATE categories SET name = $1, icon = $2, count = $3, href = $4, parent_id = $5 WHERE id = $6 RETURNING *",
      [category.name, category.icon, category.count || null, category.href || null, category.parentId || null, id]
    );
    if (res.rows.length === 0) return null;
    return category;
  } else {
    const db = await readJsonDb();
    if (!db.categories) return null;
    const idx = db.categories.findIndex((c: any) => c.id === id);
    if (idx === -1) return null;
    db.categories[idx] = { ...category, id };
    await writeJsonDb(db);
    return db.categories[idx];
  }
}

/**
 * Removes a category from the database catalog.
 * 
 * @param {string} id - Unique identifier of the category to delete.
 * @returns {Promise<boolean>} True if the category was successfully deleted, false otherwise.
 */
export async function deleteCategory(id: string, transferToCategoryId?: string): Promise<boolean> {
  if (usePostgres && pgPool) {
    if (transferToCategoryId) {
      await pgPool.query("UPDATE products SET category_id = $1 WHERE category_id = $2", [transferToCategoryId, id]);
    } else {
      await pgPool.query("UPDATE products SET category_id = NULL WHERE category_id = $1", [id]);
    }
    const res = await pgPool.query("DELETE FROM categories WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    if (!db.categories) return false;
    
    // Update products references in fallback JSON db
    if (db.products) {
      db.products = db.products.map((p: any) => {
        if (p.categoryId === id) {
          return { ...p, categoryId: transferToCategoryId || null };
        }
        return p;
      });
    }
    
    const initialLen = db.categories.length;
    db.categories = db.categories.filter((c: any) => c.id !== id);
    if (db.categories.length !== initialLen) {
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}

