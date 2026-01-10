import { Router } from 'express';
import { 
  startSession, 
  getSessionCount, 
  getLecturerSessions, 
  exportAttendanceCSV, 
  exportAttendancePDF 
} from '../controllers/session.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js'; // 👈 Matches the name above

const router = Router();

// Protect all session routes with the authenticate middleware
router.post('/start', authenticate, startSession);
router.get('/:sessionId/count', authenticate, getSessionCount);
router.get('/lecturer/:lecturerId', authenticate, getLecturerSessions);
router.get('/export/csv/:sessionId', authenticate, exportAttendanceCSV);
router.get('/export/pdf/:sessionId', authenticate, exportAttendancePDF);

export default router;