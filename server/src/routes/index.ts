import { Router } from 'express';
import rfqRoutes from './rfq.routes';
import dashboardRoutes from './dashboard.routes';
import quotationRoutes from './quotation.routes';
import documentRoutes from './document.routes';

const router = Router();

router.use('/admin/rfqs', rfqRoutes);
router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/quotations', quotationRoutes);
router.use('/documents', documentRoutes);

export default router;
