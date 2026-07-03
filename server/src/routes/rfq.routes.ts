import { Router } from 'express';
import multer from 'multer';
import { RFQController } from '../controllers/rfq.controller';
import { authenticateUser, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();
const controller = new RFQController();
const upload = multer();

router.use(authenticateUser);
router.use(requireAdmin);

router.get('/', (req, res) => controller.searchRfqs(req, res));
router.get('/:id', (req, res) => controller.getRfqById(req, res));
router.put('/:id/status', (req, res) => controller.updateStatus(req, res));
router.patch('/:id/status', (req, res) => controller.updateStatus(req, res));
router.put('/:id/assign', (req, res) => controller.updateAssignment(req, res));
router.post('/:id/assign', (req, res) => controller.updateAssignment(req, res));
router.post('/:id/notes', (req, res) => controller.addComment(req, res));
router.post('/:id/comments', (req, res) => controller.addComment(req, res));
router.post('/:id/attachments', upload.single('file'), (req, res) => controller.uploadAttachment(req, res));
router.post('/:id/watchers', (req, res) => controller.addWatcher(req, res));
router.delete('/:id/watchers/:userId', (req, res) => controller.removeWatcher(req, res));
router.delete('/:id/attachments/:attachmentId', (req, res) => controller.deleteAttachment(req, res));
router.delete('/:id', (req, res) => controller.deleteRfq(req, res));
router.post('/:id/archive', (req, res) => controller.archiveRfq(req, res));

export default router;
