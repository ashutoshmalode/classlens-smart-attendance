import express from 'express';
import {
  registerStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
} from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protect all student CRUD endpoints
router.use(protect);

router.route('/')
  .get(getAllStudents)
  .post(
    upload.fields([
      { name: 'frontImage', maxCount: 1 },
      { name: 'leftImage', maxCount: 1 },
      { name: 'rightImage', maxCount: 1 },
    ]),
    registerStudent
  );

router.route('/:id')
  .put(updateStudent)
  .delete(deleteStudent);

export default router;
