import express from 'express';
import { exportAttendanceReport } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protect reporting endpoints under admin sessions
router.use(protect);

router.get('/export', exportAttendanceReport);

export default router;
