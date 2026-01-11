import { Router } from 'express';
import { getStudentHistory, getStudentStats } from '../controllers/student.Controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @route   GET /api/student/stats/:studentId
 * @desc    Get aggregated attendance percentages for the dashboard cards
 * @access  Private (Student Only)
 */
router.get('/stats/:studentId', authenticate, getStudentStats);

/**
 * @route   GET /api/student/history
 * @desc    Get a detailed list of every attendance record (timestamped)
 * @access  Private (Student Only)
 */
router.get('/history', authenticate, getStudentHistory);

export default router;