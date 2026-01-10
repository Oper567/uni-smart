import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import jwt from 'jsonwebtoken';

export const markAttendance = async (req: AuthRequest, res: Response) => {
  const { qrToken } = req.body;
  const studentId = req.user?.profileId; 

  // 1. Initial Validation
  if (!studentId || req.user?.role !== 'STUDENT') {
    return res.status(403).json({ error: "Unauthorized: Only students can mark attendance" });
  }

  if (!qrToken) {
    return res.status(400).json({ error: "QR Code token is required" });
  }

  try {
    // 2. Verify the QR JWT
    // Use the same secret the lecturer used to generate the code
    const secret = process.env.QR_SECRET || 'fallback_qr_secret';
    const decoded: any = jwt.verify(qrToken, secret);
    const { sessionId } = decoded;

    // 3. Fetch session and verify status
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: "This attendance session no longer exists" });
    }

    // Check if session is closed or expired
    const now = new Date();
    const isExpired = now > new Date(session.endTime);
    
    if (!session.isActive || isExpired) {
      return res.status(400).json({ error: "This session is closed or has timed out" });
    }

    // 4. Record Attendance
    // Relying on the @unique([sessionId, studentId]) constraint in your Prisma schema
    const attendance = await prisma.attendance.create({
      data: {
        sessionId,
        studentId,
        status: "PRESENT",
        timestamp: now // Explicitly setting current time
      }
    });

    res.status(201).json({ 
      message: "Attendance marked successfully! ✅", 
      course: session.courseCode,
      time: attendance.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

  } catch (error: any) {
    // Handle Prisma unique constraint (Student already present)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "You've already signed in for this class!" });
    }

    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "QR code expired. Please scan the current code on the screen." });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid QR code format" });
    }

    console.error("Attendance Error:", error);
    res.status(500).json({ error: "An error occurred while marking attendance" });
  }
};