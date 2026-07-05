import { Router } from 'express';
import dashboardRoutes from './dashboard.routes';
import quotationRoutes from './quotation.routes';
import documentRoutes from '../documents/routes/document.routes';

const router = Router();

router.use('/admin/dashboard', dashboardRoutes);
router.use('/admin/quotations', quotationRoutes);
router.use('/documents', documentRoutes);

export default router;
