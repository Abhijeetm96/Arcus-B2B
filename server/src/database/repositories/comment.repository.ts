import { Pool, PoolClient } from 'pg';

export class CommentRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public async findByRfqId(rfqId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT rc.*, u.name as author_name, u.phone as author_phone
      FROM rfq_comments rc
      LEFT JOIN users u ON rc.author_id = u.id
      WHERE rc.rfq_id = $1 AND rc.is_deleted = FALSE
      ORDER BY rc.timestamp ASC
    `, [rfqId]);
    return res.rows;
  }

  public async save(client: PoolClient, comment: any): Promise<any> {
    if (comment.id) {
      const res = await client.query(`
        UPDATE rfq_comments
        SET text = $1, edited_at = CURRENT_TIMESTAMP, edited_by_id = $2
        WHERE id = $3
        RETURNING *
      `, [comment.text, comment.edited_by_id, comment.id]);
      return res.rows[0];
    } else {
      const res = await client.query(`
        INSERT INTO rfq_comments (
          rfq_id, author_id, author_name, author_role, text, timestamp, is_internal, parent_comment_id
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7)
        RETURNING *
      `, [
        comment.rfq_id,
        comment.author_id,
        comment.author_name,
        comment.author_role,
        comment.text,
        comment.is_internal !== undefined ? comment.is_internal : true,
        comment.parent_comment_id || null
      ]);
      return res.rows[0];
    }
  }

  public async softDelete(client: PoolClient, commentId: string, deletedById: string): Promise<void> {
    await client.query(`
      UPDATE rfq_comments
      SET is_deleted = TRUE, edited_at = CURRENT_TIMESTAMP, edited_by_id = $1
      WHERE id = $2
    `, [deletedById, commentId]);
  }
}
