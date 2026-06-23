/**
 * @file AuditLogService.ts
 * @description Provides business operations for managing audit and activity logs.
 */

import { pgPool, usePostgres, readJsonDb, writeJsonDb } from '../../database/db';
import { AuditLog } from './AuditLog';

export async function logAction(actionType: string, details: string, performedBy: string): Promise<AuditLog> {
  const timestamp = new Date().toISOString();
  if (usePostgres && pgPool) {
    const res = await pgPool.query(
      `INSERT INTO audit_logs (action_type, details, performed_by, timestamp) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [actionType, details, performedBy, timestamp]
    );
    const row = res.rows[0];
    return {
      id: row.id,
      actionType: row.action_type,
      details: row.details,
      performedBy: row.performed_by,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString()
    };
  } else {
    const db = await readJsonDb();
    if (!db.auditLogs) db.auditLogs = [];
    const logEntry: AuditLog = {
      id: db.auditLogs.length + 1,
      actionType,
      details,
      performedBy,
      timestamp
    };
    db.auditLogs.push(logEntry);
    await writeJsonDb(db);
    return logEntry;
  }
}

export async function getAllAuditLogs(): Promise<AuditLog[]> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC");
    return res.rows.map(row => ({
      id: row.id,
      actionType: row.action_type,
      details: row.details,
      performedBy: row.performed_by,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString()
    }));
  } else {
    const db = await readJsonDb();
    const logs = db.auditLogs || [];
    // Sort logs descending by timestamp
    return [...logs].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }
}
