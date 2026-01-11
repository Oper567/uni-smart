import express from 'express';
import AttendanceSession from '../models/AttendanceSession.js'; // Adjust to your model

const router = express.Router();

// This is the route Cron-job.org will hit
router.post('/auto-close-sessions', async (req, res) => {
  // 1. SECURITY: Check for secret header
  const cronSecret = req.headers['x-cron-secret'];
  
  if (cronSecret !== process.env.CRON_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // 2. LOGIC: Find sessions older than 2 hours that are still 'active'
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const result = await AttendanceSession.updateMany(
      { 
        isActive: true, 
        createdAt: { $lt: twoHoursAgo } 
      },
      { 
        $set: { isActive: false } 
      }
    );

    console.log(`Cron Job Success: Closed ${result.modifiedCount} sessions.`);
    
    res.status(200).json({ 
      message: 'Cleanup successful', 
      closedCount: result.modifiedCount 
    });

  } catch (error) {
    console.error('Cron Job Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;