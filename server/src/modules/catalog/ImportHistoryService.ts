/**
 * @file ImportHistoryService.ts
 * @description Provides business operations for import history.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { ImportHistory } from './ImportHistory';

export async function addImportHistory(log: ImportHistory): Promise<ImportHistory> {
  if (usePostgres && pgPool) {
    const query = `
      INSERT INTO import_history (
        id, import_date, imported_by, file_name, mode,
        products_added, products_updated, products_failed, error_report
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
      log.id,
      log.importDate,
      log.importedBy,
      log.fileName,
      log.mode,
      log.productsAdded,
      log.productsUpdated,
      log.productsFailed,
      log.errorReport || null
    ];
    await pgPool.query(query, values);
    return log;
  } else {
    const db = await readJsonDb();
    if (!db.importHistory) db.importHistory = [];
    db.importHistory.push(log);
    await writeJsonDb(db);
    return log;
  }
}

export async function getAllImportHistory(): Promise<ImportHistory[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM import_history ORDER BY import_date DESC");
    return res.rows.map(row => ({
      id: row.id,
      importDate: row.import_date,
      importedBy: row.imported_by,
      fileName: row.file_name,
      mode: row.mode,
      productsAdded: row.products_added,
      productsUpdated: row.products_updated,
      productsFailed: row.products_failed,
      errorReport: row.error_report || undefined
    }));
  } else {
    const db = await readJsonDb();
    const history = db.importHistory || [];
    return [...history].sort((a, b) => new Date(b.importDate).getTime() - new Date(a.importDate).getTime());
  }
}

export async function getImportHistoryById(id: string): Promise<ImportHistory | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM import_history WHERE id = $1", [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
      id: row.id,
      importDate: row.import_date,
      importedBy: row.imported_by,
      fileName: row.file_name,
      mode: row.mode,
      productsAdded: row.products_added,
      productsUpdated: row.products_updated,
      productsFailed: row.products_failed,
      errorReport: row.error_report || undefined
    };
  } else {
    const db = await readJsonDb();
    const log = db.importHistory?.find((h: any) => h.id === id);
    return log || null;
  }
}
