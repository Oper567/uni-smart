import { Router } from 'express';
import { getStudentHistory } from '../controllers/student.Controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// This makes the endpoint: GET /api/student/history
router.get('/history', authenticate, getStudentHistory);

export default router;