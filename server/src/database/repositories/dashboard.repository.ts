import { Pool } from 'pg';

interface CachedMetrics {
  timestamp: number;
  data: any;
}

export class DashboardRepository {
  private pool: Pool;
  private cache: Map<string, CachedMetrics> = new Map();
  private readonly CACHE_TTL = 30000; 

  constructor(pool: Pool) {
    this.pool = pool;
  }

  public evictCache(): void {
    console.log('[DashboardRepository] Evicting metrics cache due to domain event update.');
    this.cache.clear();
  }

  public async getKPIs(): Promise<any> {
    const cacheKey = 'kpis';
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    const res = await this.pool.query(`
      SELECT 
        COUNT(CASE WHEN status IN ('SUBMITTED', 'ASSIGNED', 'UNDER_REVIEW', 'NEGOTIATION') AND deleted_at IS NULL THEN 1 END) as open_rfqs,
        COUNT(CASE WHEN status = 'ASSIGNED' AND deleted_at IS NULL THEN 1 END) as assigned_rfqs,
        COUNT(CASE WHEN status IN ('SUBMITTED', 'UNDER_REVIEW') AND deleted_at IS NULL THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'NEGOTIATION' AND deleted_at IS NULL THEN 1 END) as negotiation,
        COUNT(CASE WHEN status = 'APPROVED' AND deleted_at IS NULL THEN 1 END) as approved,
        COUNT(CASE WHEN status = 'REJECTED' AND deleted_at IS NULL THEN 1 END) as rejected,
        COUNT(CASE WHEN status = 'CONVERTED' AND deleted_at IS NULL THEN 1 END) as converted,
        COUNT(CASE WHEN due_date < CURRENT_TIMESTAMP AND status NOT IN ('APPROVED', 'CONVERTED', 'REJECTED', 'EXPIRED') AND deleted_at IS NULL THEN 1 END) as overdue
      FROM rfqs
    `);

    const data = {
      open_rfqs: parseInt(res.rows[0].open_rfqs),
      assigned_rfqs: parseInt(res.rows[0].assigned_rfqs),
      pending_review: parseInt(res.rows[0].pending_review),
      negotiation: parseInt(res.rows[0].negotiation),
      approved: parseInt(res.rows[0].approved),
      rejected: parseInt(res.rows[0].rejected),
      converted: parseInt(res.rows[0].converted),
      overdue: parseInt(res.rows[0].overdue)
    };
    this.cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  }

  public async getDistributions(): Promise<any> {
    const cacheKey = 'distributions';
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
      return cached.data;
    }

    const [statusDist, priorityDist, categoryDist, ownerDist] = await Promise.all([
      this.pool.query(`
        SELECT status, COUNT(*) as count 
        FROM rfqs 
        WHERE deleted_at IS NULL 
        GROUP BY status
      `),
      this.pool.query(`
        SELECT priority, COUNT(*) as count 
        FROM rfqs 
        WHERE deleted_at IS NULL 
        GROUP BY priority
      `),
      this.pool.query(`
        SELECT category, COUNT(*) as count 
        FROM rfqs 
        WHERE deleted_at IS NULL AND category IS NOT NULL
        GROUP BY category 
        ORDER BY count DESC 
        LIMIT 5
      `),
      this.pool.query(`
        SELECT u.name as owner_name, COUNT(r.id) as count
        FROM rfqs r
        JOIN users u ON r.assigned_to_id = u.id
        WHERE r.deleted_at IS NULL
        GROUP BY u.name
        ORDER BY count DESC
        LIMIT 5
      `)
    ]);

    const data = {
      status: statusDist.rows.map((r: any) => ({ name: r.status, value: parseInt(r.count) })),
      priority: priorityDist.rows.map((r: any) => ({ name: r.priority, value: parseInt(r.count) })),
      category: categoryDist.rows.map((r: any) => ({ name: r.category, value: parseInt(r.count) })),
      owner: ownerDist.rows.map((r: any) => ({ name: r.owner_name, value: parseInt(r.count) }))
    };

    this.cache.set(cacheKey, { timestamp: Date.now(), data });
    return data;
  }
}
