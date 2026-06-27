import express from 'express';
import {
  registerAdmin,
  loginAdmin,
  loginStudent,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect, protectStudent } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-admin', registerAdmin);
router.post('/login', loginAdmin);
router.post('/student-login', loginStudent);
router.post('/logout', logout);

// Get currently logged-in user profile (works for both faculty and students depending on headers/cookies)
router.get('/me', (req, res, next) => {
  const adminToken = req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer') && !req.headers.authorization.includes('student'));
  
  if (adminToken) {
    protect(req, res, next);
  } else {
    protectStudent(req, res, next);
  }
}, getMe);

export default router;
