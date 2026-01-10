import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';

export const markAttendance = async (req: AuthRequest, res: Response) => {
  // 1. Support both 'qrToken' (old) and 'sessionId' (new) from frontend
  const { qrToken, sessionId: rawSessionId } = req.body;
  const tokenToVerify = qrToken || rawSessionId; 
  
  const studentId = req.user?.profileId; 

  if (!studentId || req.user?.role !== 'STUDENT') {
    return res.status(403).json({ error: "Unauthorized: Only students can mark attendance" });
  }

  if (!tokenToVerify) {
    // This matches the error you were seeing
    return res.status(400).json({ error: "QR Code token is required" });
  }

  try {
    // 2. Verify the QR JWT
    const secret = process.env.QR_SECRET || 'fallback_qr_secret';
    const decoded: any = jwt.verify(tokenToVerify, secret);
    
    // Extract sessionId from the JWT payload
    const sessionIdFromToken = decoded.sessionId;

    // 3. Fetch session and verify status
    const session = await prisma.session.findUnique({
      where: { id: sessionIdFromToken },
    });

    if (!session) {
      return res.status(404).json({ error: "This attendance session no longer exists" });
    }

    const now = new Date();
    const isExpired = now > new Date(session.endTime);
    
    if (!session.isActive || isExpired) {
      return res.status(400).json({ error: "This session is closed or has timed out" });
    }

    // 4. Record Attendance
    const attendance = await prisma.attendance.create({
      data: {
        sessionId: sessionIdFromToken,
        studentId,
        status: "PRESENT",
        timestamp: now 
      }
    });

    return res.status(201).json({ 
      message: "Attendance marked successfully! ✅", 
      courseCode: session.courseCode, // Changed to courseCode to match your frontend status text
      time: attendance.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

  } catch (error: any) {
    // Unique constraint: Student already present
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "You've already signed in for this class!" });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "QR code expired. Please scan the current code." });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid QR code format" });
    }

    console.error("Attendance Error:", error);
    return res.status(500).json({ error: "An error occurred while marking attendance" });
  }
};