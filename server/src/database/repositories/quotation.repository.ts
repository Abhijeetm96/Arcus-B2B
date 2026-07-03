import { Pool, PoolClient } from 'pg';

export class QuotationRepository {
  private pool: Pool;

  constructor(pool: Pool) {
    this.pool = pool;
  }

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

  public async getNextSequence(client: PoolClient): Promise<string> {
    const res = await client.query('SELECT COUNT(*) as total FROM quotations');
    const count = parseInt(res.rows[0].total, 10) + 1;
    const year = new Date().getFullYear();
    const padded = String(count).padStart(6, '0');
    return `QT-${year}-${padded}`;
  }

  public async findById(id: string): Promise<any> {
    const res = await this.pool.query(`
      SELECT q.*, qt.currency_code, qt.exchange_rate, qt.base_currency, 
             qt.subtotal, qt.discount, qt.taxable_amount, qt.gst_amount, 
             qt.shipping, qt.other_charges, qt.grand_total, qt.calculation_audit,
             u_creator.name as creator_name, u_creator.role as creator_role,
             u_approver.name as approver_name
      FROM quotations q
      JOIN quotation_totals qt ON q.id = qt.quotation_id
      JOIN users u_creator ON q.created_by_id = u_creator.id
      LEFT JOIN users u_approver ON q.approved_by_id = u_approver.id
      WHERE q.id = $1 AND q.deleted_at IS NULL
    `, [id]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  }

  public async findItemsByQuotationId(quotationId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT * FROM quotation_items WHERE quotation_id = $1 ORDER BY position ASC
    `, [quotationId]);
    return res.rows;
  }

  public async findVersionsByQuotationId(quotationId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT qv.*, u.name as creator_name 
      FROM quotation_versions qv
      JOIN users u ON qv.created_by_id = u.id
      WHERE qv.quotation_id = $1 ORDER BY qv.version DESC
    `, [quotationId]);
    return res.rows;
  }

  public async findApprovalsByQuotationId(quotationId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT qa.*, u.name as approver_name, u.admin_role as approver_role
      FROM quotation_approvals qa
      JOIN users u ON qa.approver_id = u.id
      WHERE qa.quotation_id = $1 ORDER BY qa.timestamp ASC
    `, [quotationId]);
    return res.rows;
  }

  public async findShareLogsByQuotationId(quotationId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT * FROM quotation_share_logs WHERE quotation_id = $1 ORDER BY timestamp DESC
    `, [quotationId]);
    return res.rows;
  }

  public async findByRfqId(rfqId: string): Promise<any[]> {
    const res = await this.pool.query(`
      SELECT q.*, qt.grand_total, qt.currency_code
      FROM quotations q
      JOIN quotation_totals qt ON q.id = qt.quotation_id
      WHERE q.rfq_id = $1 AND q.deleted_at IS NULL
      ORDER BY q.version DESC
    `, [rfqId]);
    return res.rows;
  }

  public async save(
    client: PoolClient,
    quote: any,
    totals: any,
    items: any[]
  ): Promise<any> {
    // 1. Insert or Update Quotation Header
    const isNew = !quote.id;
    let quoteId = quote.id;

    if (isNew) {
      const qRes = await client.query(`
        INSERT INTO quotations (
          quotation_number, rfq_id, version, status, customer_snapshot, 
          public_token, expires_at, created_by_id
        )
        VALUES ($1, $2, $3, $4, $5, gen_random_uuid(), $6, $7)
        RETURNING *
      `, [
        quote.quotation_number,
        quote.rfq_id,
        quote.version || 1,
        quote.status || 'DRAFT',
        JSON.stringify(quote.customer_snapshot),
        quote.expires_at || null,
        quote.created_by_id
      ]);
      quoteId = qRes.rows[0].id;
    } else {
      // Optimistic Locking Check
      const lockRes = await client.query(`
        SELECT version FROM quotations WHERE id = $1
      `, [quoteId]);
      if (lockRes.rows.length === 0) {
        throw new Error(`Quotation not found: ${quoteId}`);
      }
      if (lockRes.rows[0].version !== quote.version) {
        throw new Error('Optimistic Lock Failure: Quotation was modified by another transaction.');
      }

      await client.query(`
        UPDATE quotations
        SET status = $1, customer_snapshot = $2, expires_at = $3, 
            version = version + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [
        quote.status,
        JSON.stringify(quote.customer_snapshot),
        quote.expires_at || null,
        quoteId
      ]);
    }

    // 2. Save Totals
    await client.query(`
      INSERT INTO quotation_totals (
        quotation_id, currency_code, exchange_rate, base_currency, subtotal, 
        discount, taxable_amount, gst_amount, shipping, other_charges, grand_total, calculation_audit
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (quotation_id) DO UPDATE
      SET currency_code = EXCLUDED.currency_code,
          exchange_rate = EXCLUDED.exchange_rate,
          subtotal = EXCLUDED.subtotal,
          discount = EXCLUDED.discount,
          taxable_amount = EXCLUDED.taxable_amount,
          gst_amount = EXCLUDED.gst_amount,
          shipping = EXCLUDED.shipping,
          other_charges = EXCLUDED.other_charges,
          grand_total = EXCLUDED.grand_total,
          calculation_audit = EXCLUDED.calculation_audit;
    `, [
      quoteId,
      totals.currency_code || 'INR',
      totals.exchange_rate || 1.0,
      totals.base_currency || 'INR',
      totals.subtotal,
      totals.discount || 0,
      totals.taxable_amount,
      totals.gst_amount,
      totals.shipping || 0,
      totals.other_charges || 0,
      totals.grand_total,
      JSON.stringify(totals.calculation_audit || {})
    ]);

    // 3. Save Items (Delete first, then insert to maintain simple position snapshots)
    await client.query(`DELETE FROM quotation_items WHERE quotation_id = $1`, [quoteId]);
    
    for (const item of items) {
      const qty = Number(item.quantity || 0);
      const rate = Number(item.rate || 0);
      const discPercent = Number(item.discount_percent || 0);
      const taxPercent = Number(item.tax_percent || 0);

      const discAmount = item.discount_amount !== undefined && item.discount_amount !== null
        ? item.discount_amount
        : (qty * rate * (discPercent / 100));

      const subtotal = item.subtotal !== undefined && item.subtotal !== null
        ? item.subtotal
        : (qty * rate - discAmount);

      const taxAmount = item.tax_amount !== undefined && item.tax_amount !== null
        ? item.tax_amount
        : (subtotal * (taxPercent / 100));

      const finalAmount = item.final_amount !== undefined && item.final_amount !== null
        ? item.final_amount
        : (subtotal + taxAmount);

      await client.query(`
        INSERT INTO quotation_items (
          quotation_id, product_id, product_snapshot, quantity, rate, 
          discount_percent, discount_amount, tax_percent, tax_amount, 
          subtotal, final_amount, remarks, position
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        quoteId,
        item.product_id || null,
        JSON.stringify(item.product_snapshot || {}),
        qty,
        rate,
        discPercent,
        discAmount,
        taxPercent,
        taxAmount,
        subtotal,
        finalAmount,
        item.remarks || null,
        item.position || 0
      ]);
    }

    return this.findById(quoteId);
  }

  public async saveVersion(
    client: PoolClient,
    quotationId: string,
    versionNum: number,
    createdById: string,
    reason: string
  ): Promise<void> {
    await client.query(`
      INSERT INTO quotation_versions (quotation_id, version, created_by_id, reason)
      VALUES ($1, $2, $3, $4)
    `, [quotationId, versionNum, createdById, reason]);
  }

  public async saveApproval(client: PoolClient, approval: any): Promise<void> {
    await client.query(`
      INSERT INTO quotation_approvals (
        quotation_id, approver_id, approval_level, notes, 
        signature_hash, signed_document_hash, certificate_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      approval.quotation_id,
      approval.approver_id,
      approval.approval_level || 1,
      approval.notes || null,
      approval.signature_hash || null,
      approval.signed_document_hash || null,
      approval.certificate_id || null
    ]);
  }

  public async saveShareLog(client: PoolClient, log: any): Promise<void> {
    await client.query(`
      INSERT INTO quotation_share_logs (quotation_id, share_channel, recipient, share_status, ip_address)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      log.quotation_id,
      log.share_channel,
      log.recipient || null,
      log.share_status || 'PENDING',
      log.ip_address || null
    ]);
  }

  public async updateStatus(
    client: PoolClient,
    id: string,
    status: string,
    currentVersion: number
  ): Promise<void> {
    const res = await client.query(`
      UPDATE quotations
      SET status = $1, version = version + 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND version = $3
    `, [status, id, currentVersion]);
    if (res.rowCount === 0) {
      throw new Error('Optimistic Lock Failure: Quotation status could not be updated due to a version conflict.');
    }
  }
}
