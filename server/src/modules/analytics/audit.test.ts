import { test, describe, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { logAction, getAllAuditLogs } from './AuditLogService';
import * as db from '../../database/db';

describe('Audit Log Service Tests', () => {
  let mockLogs: any[] = [];

  before(() => {
    mock.method(db, 'readJsonDb', () => {
      return { auditLogs: mockLogs };
    });

    mock.method(db, 'writeJsonDb', (data: any) => {
      mockLogs = data.auditLogs;
      return true;
    });

    // Disable postgres mode
    (db as any).usePostgres = false;
  });

  after(() => {
    mock.reset();
  });

  test('should successfully write and read back audit logs', async () => {
    mockLogs = [];
    const logged = await logAction('order_status_update', 'Updated to Dispatched', 'admin-1');
    assert.ok(logged);

    const logs = await getAllAuditLogs();
    assert.strictEqual(logs.length, 1);
    assert.strictEqual(logs[0].performedBy, 'admin-1');
    assert.strictEqual(logs[0].actionType, 'order_status_update');
    assert.strictEqual(logs[0].details, 'Updated to Dispatched');
  });
});
