// src/controllers/report.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getSessionReport = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  const lecturerId = req.user?.profileId;

  try {
    // 1. First, verify this lecturer actually owns this session
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session || session.lecturerId !== lecturerId) {
      return res.status(403).json({ error: "Unauthorized: You can only view reports for your own sessions" });
    }

    // 2. Fetch all attendance records with nested Student & User data
    const attendanceRecords = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // 3. Format the data for a clean Frontend Table
    const report = {
      courseCode: session.courseCode,
      sessionDate: session.createdAt,
      totalPresent: attendanceRecords.length,
      students: attendanceRecords.map(record => ({
        name: record.student.user.name,
        email: record.student.user.email,
        matricNo: record.student.matricNo,
        signedInAt: record.timestamp,
        status: record.status
      }))
    };

    res.json(report);
  } catch (error) {
    console.error("Report Error:", error);
    res.status(500).json({ error: "Failed to generate attendance report" });
  }
};