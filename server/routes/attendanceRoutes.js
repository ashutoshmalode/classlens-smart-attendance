import express from 'express';
import {
  processAttendanceSession,
  getAttendanceByDate,
  markAttendanceManually,
  resolveUnknownFace,
  getMyAttendance,
} from '../controllers/attendanceController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Student self-lookup route (accessible by student authentication tokens)
router.get('/my-attendance', protectStudent, getMyAttendance);

// Protect all following routes under admin/faculty validation
router.use(protect);

router.post('/session', upload.array('classroomPhotos', 10), processAttendanceSession);
router.get('/', getAttendanceByDate);
router.put('/manual', markAttendanceManually);
router.post('/resolve-unknown', resolveUnknownFace);

export default router;
