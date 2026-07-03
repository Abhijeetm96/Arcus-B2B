import { Pool, PoolClient } from 'pg';
import { RFQSearchBuilder } from './RFQSearchBuilder';
import { RFQStatus, Priority } from '../../domain/rfq/RFQConstants';

export class RFQRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  /**
   * Executes a database query inside a managed PostgreSQL transaction.
   */
  public async executeTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const result = await work(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  public async getNextSequence(client: PoolClient, prefix: string): Promise<number> {
    const res = await client.query(`
      SELECT COUNT(*) as total FROM rfqs
    `);
    return parseInt(res.rows[0].total) + 1;
  }

  public async findById(id: string): Promise<any> {
    const res = await this.pool.query(`
      SELECT r.*, 
        u_creator.name as creator_name,
        u_assigned.name as assigned_name,
        u_archived.name as archived_name
      FROM rfqs r
      LEFT JOIN users u_creator ON r.created_by_id = u_creator.id
      LEFT JOIN users u_assigned ON r.assigned_to_id = u_assigned.id
      LEFT JOIN users u_archived ON r.archived_by_id = u_archived.id
      WHERE r.id = $1 AND r.deleted_at IS NULL
    `, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async findItemsByRfqId(rfqId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT * FROM rfq_items WHERE rfq_id = $1 ORDER BY id ASC
    `, [rfqId]);
    return res.rows;
  }

  public async findWatchersByRfqId(rfqId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT rw.*, u.name, u.email 
      FROM rfq_watchers rw
      JOIN users u ON rw.user_id = u.id
      WHERE rw.rfq_id = $1
    `, [rfqId]);
    return res.rows;
  }

  public async findAssignmentsByRfqId(rfqId: string): Promise<any> {
    const res = await this.pool.query(`
      SELECT ra.*, 
        u_pri.name as primary_owner_name,
        u_sec.name as secondary_owner_name
      FROM rfq_assignments ra
      LEFT JOIN users u_pri ON ra.primary_owner_id = u_pri.id
      LEFT JOIN users u_sec ON ra.secondary_owner_id = u_sec.id
      WHERE ra.rfq_id = $1
    `, [rfqId]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async findAssignmentHistoryByRfqId(rfqId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT rah.*,
        u_pri.name as primary_owner_name,
        u_sec.name as secondary_owner_name,
        u_by.name as assigned_by_name
      FROM rfq_assignment_history rah
      LEFT JOIN users u_pri ON rah.primary_owner_id = u_pri.id
      LEFT JOIN users u_sec ON rah.secondary_owner_id = u_sec.id
      LEFT JOIN users u_by ON rah.assigned_by_id = u_by.id
      WHERE rah.rfq_id = $1
      ORDER BY rah.assigned_at DESC
    `, [rfqId]);
    return res.rows;
  }

  public async findPaginated(builder: RFQSearchBuilder): Promise<{ rows: any[]; total: number }> {
    const { query, params } = builder.build();
    const countRes = builder.buildCountQuery();
    
    const [dataRes, totalRes] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query(countRes.query, countRes.params)
    ]);

    return {
      rows: dataRes.rows,
      total: parseInt(totalRes.rows[0].total)
    };
  }

  public async save(client: PoolClient, rfq: any): Promise<any> {
    if (rfq.id) {
      const lockRes = await client.query(`
        SELECT version FROM rfqs WHERE id = $1
      `, [rfq.id]);
      if (lockRes.rows.length > 0) {
        const currentVersion = lockRes.rows[0].version;
        if (currentVersion !== rfq.version) {
          throw new Error(`Optimistic Locking Failure: RFQ has been updated by another operator (expected v${rfq.version}, found v${currentVersion}). Please reload.`);
        }
      }

      const nextVersion = rfq.version + 1;
      const res = await client.query(`
        UPDATE rfqs
        SET status = $1, priority = $2, assigned_to_id = $3, 
            due_date = $4, reminder_date = $5, version = $6,
            updated_at = CURRENT_TIMESTAMP, updated_by_id = $7
        WHERE id = $8 AND version = $9
        RETURNING *
      `, [
        rfq.status,
        rfq.priority,
        rfq.assigned_to_id,
        rfq.due_date,
        rfq.reminder_date,
        nextVersion,
        rfq.updated_by_id || null,
        rfq.id,
        rfq.version
      ]);

      if (res.rows.length === 0) {
        throw new Error('Concurrent modification detected or RFQ not found.');
      }
      return res.rows[0];
    } else {
      const res = await client.query(`
        INSERT INTO rfqs (
          rfq_number, version, name, phone, category, quantity, location, details,
          created_by_id, assigned_to_id, status, priority, due_date, reminder_date, value, project_type, customer_json
        )
        VALUES ($1, 1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `, [
        rfq.rfq_number,
        rfq.name,
        rfq.phone,
        rfq.category,
        rfq.quantity,
        rfq.location,
        rfq.details,
        rfq.created_by_id,
        rfq.assigned_to_id,
        rfq.status || 'SUBMITTED',
        rfq.priority || 'MEDIUM',
        rfq.due_date,
        rfq.reminder_date,
        rfq.value || 0.00,
        rfq.project_type || 'General',
        JSON.stringify(rfq.customer_json || {})
      ]);
      return res.rows[0];
    }
  }

  public async updateAssignment(
    client: PoolClient,
    rfqId: string,
    primaryOwnerId: string,
    secondaryOwnerId: string | null,
    assignedById: string,
    notes?: string,
    reason?: string
  ): Promise<void> {
    await client.query(`
      INSERT INTO rfq_assignments (rfq_id, primary_owner_id, secondary_owner_id, assigned_by_id, assigned_at, notes, reason)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6)
      ON CONFLICT (rfq_id) DO UPDATE
      SET primary_owner_id = EXCLUDED.primary_owner_id,
          secondary_owner_id = EXCLUDED.secondary_owner_id,
          assigned_by_id = EXCLUDED.assigned_by_id,
          assigned_at = CURRENT_TIMESTAMP,
          notes = EXCLUDED.notes,
          reason = EXCLUDED.reason
    `, [rfqId, primaryOwnerId, secondaryOwnerId, assignedById, notes || null, reason || null]);

    await client.query(`
      INSERT INTO rfq_assignment_history (rfq_id, primary_owner_id, secondary_owner_id, assigned_by_id, assigned_at, notes, reason)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5, $6)
    `, [rfqId, primaryOwnerId, secondaryOwnerId, assignedById, notes || null, reason || null]);

    await client.query(`
      UPDATE rfqs
      SET assigned_to_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [primaryOwnerId, rfqId]);
  }

  public async addWatcher(client: PoolClient, rfqId: string, userId: string): Promise<void> {
    await client.query(`
      INSERT INTO rfq_watchers (rfq_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [rfqId, userId]);
  }

  public async removeWatcher(client: PoolClient, rfqId: string, userId: string): Promise<void> {
    await client.query(`
      DELETE FROM rfq_watchers WHERE rfq_id = $1 AND user_id = $2
    `, [rfqId, userId]);
  }

  public async softDelete(client: PoolClient, rfqId: string, deletedById: string): Promise<void> {
    await client.query(`
      UPDATE rfqs
      SET deleted_at = CURRENT_TIMESTAMP, deleted_by_id = $1
      WHERE id = $2
    `, [deletedById, rfqId]);
  }

  public async archive(client: PoolClient, rfqId: string, archivedById: string): Promise<void> {
    await client.query(`
      UPDATE rfqs
      SET is_archived = TRUE, archived_at = CURRENT_TIMESTAMP, archived_by_id = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [archivedById, rfqId]);
  }
}
