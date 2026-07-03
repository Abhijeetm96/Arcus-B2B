import { Response } from 'express';
import { pgPool } from '../database/db';
import { DashboardRepository } from '../database/repositories/dashboard.repository';
import { ActivityRepository } from '../database/repositories/activity.repository';

const pool = pgPool!;
export const dashboardRepo = new DashboardRepository(pool);
const activityRepo = new ActivityRepository(pool);

export class DashboardController {
  
  public async getMetrics(req: any, res: Response) {
    try {
      const [kpis, distributions, recentActivities] = await Promise.all([
        dashboardRepo.getKPIs(),
        dashboardRepo.getDistributions(),
        activityRepo.getRecentGlobal(10)
      ]);

      res.json({
        success: true,
        kpis,
        distributions,
        recentActivities
      });
    } catch (err: any) {
      console.error('[DashboardController] getMetrics error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async evictCache(req: any, res: Response) {
    try {
      dashboardRepo.evictCache();
      res.json({ success: true, message: 'Cache cleared successfully' });
    } catch (err: any) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
