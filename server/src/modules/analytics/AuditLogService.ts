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

export async function getClearRequestTime(): Promise<string | null> {
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT value FROM settings WHERE key = 'audit_logs_clear_requested_at'");
    return res.rows.length > 0 ? res.rows[0].value : null;
  } else {
    const db = await readJsonDb();
    return db.audit_logs_clear_requested_at || null;
  }
}

export async function cancelClearAuditLogs(): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query("DELETE FROM settings WHERE key = 'audit_logs_clear_requested_at'");
  } else {
    const db = await readJsonDb();
    delete db.audit_logs_clear_requested_at;
    await writeJsonDb(db);
  }
}

export async function requestClearAuditLogs(timestamp: string): Promise<void> {
  if (usePostgres && pgPool) {
    await pgPool.query(
      "INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2",
      ['audit_logs_clear_requested_at', timestamp]
    );
  } else {
    const db = await readJsonDb();
    db.audit_logs_clear_requested_at = timestamp;
    await writeJsonDb(db);
  }
}

export async function getAllAuditLogs(): Promise<AuditLog[]> {
  let clearRequestTime: string | null = null;
  const now = new Date();

  // 1. Fetch clear request time and purge if expired
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT value FROM settings WHERE key = 'audit_logs_clear_requested_at'");
    if (res.rows.length > 0) {
      clearRequestTime = res.rows[0].value;
    }
  } else {
    const db = await readJsonDb();
    clearRequestTime = db.audit_logs_clear_requested_at || null;
  }

  if (clearRequestTime) {
    const clearTime = new Date(clearRequestTime);
    const diffMs = now.getTime() - clearTime.getTime();
    if (diffMs > 48 * 60 * 60 * 1000) {
      // 48 hours have passed, permanently purge logs created before clearTime
      if (usePostgres && pgPool) {
        await pgPool.query("DELETE FROM audit_logs WHERE timestamp < $1", [clearTime]);
        await pgPool.query("DELETE FROM settings WHERE key = 'audit_logs_clear_requested_at'");
      } else {
        const db = await readJsonDb();
        db.auditLogs = (db.auditLogs || []).filter(
          (log: any) => new Date(log.timestamp).getTime() >= clearTime.getTime()
        );
        delete db.audit_logs_clear_requested_at;
        await writeJsonDb(db);
      }
      clearRequestTime = null;
    }
  }

  // 2. Fetch and format audit logs
  let rawLogs: AuditLog[] = [];
  if (usePostgres && pgPool) {
    const res = await pgPool.query("SELECT * FROM audit_logs ORDER BY timestamp DESC");
    rawLogs = res.rows.map(row => ({
      id: row.id,
      actionType: row.action_type,
      details: row.details,
      performedBy: row.performed_by,
      timestamp: row.timestamp instanceof Date ? row.timestamp.toISOString() : new Date(row.timestamp).toISOString()
    }));
  } else {
    const db = await readJsonDb();
    const logs = db.auditLogs || [];
    rawLogs = [...logs].sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime());
  }

  // 3. Mark pending deletions if grace period is active
  if (clearRequestTime) {
    const clearTime = new Date(clearRequestTime);
    const deleteScheduledAt = new Date(clearTime.getTime() + 48 * 60 * 60 * 1000).toISOString();
    rawLogs = rawLogs.map(log => {
      if (log.timestamp && new Date(log.timestamp).getTime() < clearTime.getTime()) {
        return {
          ...log,
          pendingDeletion: true,
          deleteScheduledAt
        };
      }
      return log;
    });
  }

  return rawLogs;
}
