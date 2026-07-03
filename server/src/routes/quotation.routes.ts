import { Router } from 'express';
import { QuotationController } from '../controllers/quotation.controller';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const controller = new QuotationController();

// All quotation routes require active authentication
router.use(authenticateUser);

router.get('/rfq/:rfqId', (req, res) => controller.getQuotationsByRfq(req, res));
router.get('/:id', (req, res) => controller.getQuotation(req, res));
router.post('/', (req, res) => controller.createQuotation(req, res));
router.put('/:id', (req, res) => controller.updateQuotation(req, res));
router.post('/:id/new-version', (req, res) => controller.createRevision(req, res));
router.post('/:id/send', (req, res) => controller.sendQuotation(req, res));
router.post('/:id/approve', (req, res) => controller.approveQuotation(req, res));
router.post('/:id/reject', (req, res) => controller.rejectQuotation(req, res));
router.post('/:id/convert', (req, res) => controller.convertToOrder(req, res));
router.get('/:id/pdf', (req, res) => controller.getPdf(req, res));

export default router;
