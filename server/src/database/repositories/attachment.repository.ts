import { Pool, PoolClient } from 'pg';

export class AttachmentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findByEntity(entityType: string, entityId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT a.*, u.name as uploader_name
      FROM attachments a
      LEFT JOIN users u ON a.uploaded_by_id = u.id
      WHERE a.entity_type = $1 AND a.entity_id = $2
      ORDER BY a.uploaded_at DESC
    `, [entityType.toUpperCase(), entityId]);
    return res.rows;
  }

  public async save(client: PoolClient, attachment: any): Promise<any> {
    const res = await client.query(`
      INSERT INTO attachments (
        entity_type, entity_id, filename, storage_provider, storage_key,
        public_url, mime_type, size, uploaded_by_id, uploaded_at, version, checksum
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, $10, $11)
      RETURNING *
    `, [
      attachment.entity_type.toUpperCase(),
      attachment.entity_id,
      attachment.filename,
      attachment.storage_provider || 'local',
      attachment.storage_key || null,
      attachment.public_url || null,
      attachment.mime_type,
      attachment.size,
      attachment.uploaded_by_id,
      attachment.version || 'v1.0',
      attachment.checksum || null
    ]);
    return res.rows[0];
  }

  public async delete(client: PoolClient, id: string): Promise<void> {
    await client.query(`
      DELETE FROM attachments WHERE id = $1
    `, [id]);
  }
}
