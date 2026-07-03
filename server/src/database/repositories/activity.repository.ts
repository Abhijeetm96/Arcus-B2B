import { Pool, PoolClient } from 'pg';

export class ActivityRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findByEntity(entityType: string, entityId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT al.*, u.name as performer_name
      FROM activity_logs al
      LEFT JOIN users u ON al.performed_by_id = u.id
      WHERE al.entity_type = $1 AND al.entity_id = $2
      ORDER BY al.timestamp DESC
    `, [entityType.toUpperCase(), entityId]);
    return res.rows;
  }

  public async save(client: PoolClient, log: any): Promise<any> {
    const res = await client.query(`
      INSERT INTO activity_logs (
        entity_type, entity_id, action, title, description, timestamp, performed_by_id, prev_value, new_value, metadata
      )
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8, $9)
      RETURNING *
    `, [
      log.entity_type.toUpperCase(),
      log.entity_id,
      log.action,
      log.title,
      log.description || null,
      log.performed_by_id,
      log.prev_value || null,
      log.new_value || null,
      JSON.stringify(log.metadata || {})
    ]);
    return res.rows[0];
  }

  public async getRecentGlobal(limit: number = 10): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT al.*, u.name as performer_name, r.rfq_number
      FROM activity_logs al
      LEFT JOIN users u ON al.performed_by_id = u.id
      LEFT JOIN rfqs r ON al.entity_id = r.id AND al.entity_type = 'RFQ'
      ORDER BY al.timestamp DESC
      LIMIT $1
    `, [limit]);
    return res.rows;
  }
}
