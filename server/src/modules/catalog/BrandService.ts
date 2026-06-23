/**
 * @file BrandService.ts
 * @description Provides business operations for managing Product Brands.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { Brand } from './Brand';

export async function getAllBrands(): Promise<Brand[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM brands ORDER BY name ASC");
    return res.rows.map(r => ({
      id: r.id,
      name: r.name,
      logo: r.logo || undefined,
      description: r.description || undefined,
      status: r.status
    }));
  } else {
    const db = await readJsonDb();
    return db.brands || [];
  }
}

export async function getBrandById(id: string): Promise<Brand | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM brands WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      logo: r.logo || undefined,
      description: r.description || undefined,
      status: r.status
    };
  } else {
    const db = await readJsonDb();
    const brand = db.brands?.find((b: any) => b.id === id);
    return brand || null;
  }
}

export async function addBrand(brand: Brand): Promise<Brand> {
  if (usePostgres && pgPool) {
    await pgPool.query(
      `INSERT INTO brands (id, name, logo, description, status) 
       VALUES ($1, $2, $3, $4, $5)`,
      [brand.id, brand.name, brand.logo || null, brand.description || null, brand.status || 'ACTIVE']
    );
    return brand;
  } else {
    const db = await readJsonDb();
    if (!db.brands) db.brands = [];
    db.brands.push(brand);
    await writeJsonDb(db);
    return brand;
  }
}

export async function updateBrand(id: string, updates: Partial<Brand>): Promise<Brand | null> {
  if (usePostgres && pgPool) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const [key, val] of Object.entries(updates)) {
      if (key === 'id') continue;
      fields.push(`${key} = $${idx}`);
      values.push(val === undefined ? null : val);
      idx++;
    }
    if (fields.length === 0) return getBrandById(id);
    values.push(id);
    const query = `UPDATE brands SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    const res = await pgPool.query(query, values);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      logo: r.logo || undefined,
      description: r.description || undefined,
      status: r.status
    };
  } else {
    const db = await readJsonDb();
    const brandIdx = db.brands?.findIndex((b: any) => b.id === id);
    if (brandIdx === undefined || brandIdx === -1) return null;
    const updated = { ...db.brands[brandIdx], ...updates };
    db.brands[brandIdx] = updated;
    await writeJsonDb(db);
    return updated;
  }
}

export async function deleteBrand(id: string): Promise<boolean> {
  // Archive or delete
  if (usePostgres && pgPool) {
    const res = await pgPool.query("UPDATE brands SET status = 'ARCHIVED' WHERE id = $1", [id]);
    return (res.rowCount ?? 0) > 0;
  } else {
    const db = await readJsonDb();
    const brandIdx = db.brands?.findIndex((b: any) => b.id === id);
    if (brandIdx === undefined || brandIdx === -1) return false;
    db.brands[brandIdx].status = 'ARCHIVED';
    await writeJsonDb(db);
    return true;
  }
}
