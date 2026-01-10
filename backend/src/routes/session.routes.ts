import { Router } from 'express';
import { 
  startSession, 
  getSessionCount, 
  getLecturerSessions, 
  exportAttendanceCSV, 
  exportAttendancePDF,
  closeSession // 👈 Added the new controller function
} from '../controllers/session.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// --- SESSION MANAGEMENT ---

// Start a new QR session
router.post('/start', authenticate, startSession);

// Close a session manually (Lecturer clicks "End Session")
router.patch('/close/:sessionId', authenticate, closeSession);

// Get real-time count of students who have scanned
router.get('/:sessionId/count', authenticate, getSessionCount);

// Get all previous sessions for a specific lecturer
router.get('/lecturer/:lecturerId', authenticate, getLecturerSessions);


// --- EXPORT ROUTES ---

// Export attendance to CSV
router.get('/export/csv/:sessionId', authenticate, exportAttendanceCSV);

// Export attendance to PDF
router.get('/export/pdf/:sessionId', authenticate, exportAttendancePDF);

export default router;