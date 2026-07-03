import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DocumentController();

// Document Engine rendering endpoint
router.get('/:id', authenticateUser, requireAdmin, (req, res) => controller.renderDocument(req, res));

export default router;
