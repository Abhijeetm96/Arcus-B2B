import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

router.use(authenticateUser);
router.use(requireAdmin);

router.get('/metrics', (req, res) => controller.getMetrics(req, res));
router.post('/evict-cache', (req, res) => controller.evictCache(req, res));

export default router;
