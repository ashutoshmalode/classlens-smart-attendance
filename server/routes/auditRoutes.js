import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admin / faculty can view audit logs
router.use(protect);

router.get('/', getAuditLogs);

export default router;
