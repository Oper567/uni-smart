import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

// --- 1. GET STUDENT STATS (For Dashboard Cards) ---
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.profileId;

  if (!studentId) {
    return res.status(401).json({ error: "Student profile not found" });
  }

  try {
    // 1. Fetch all attendance records for this student
    const attendance = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          select: { courseCode: true }
        }
      }
    });

    // 2. Get unique course codes the student has interacted with
    const attendedCourseCodes = [...new Set(attendance.map(a => a.session.courseCode))];

    // 3. For each course, calculate the stats
    const stats = await Promise.all(attendedCourseCodes.map(async (code) => {
      // Count how many times this student attended this course
      const attendedCount = attendance.filter(a => a.session.courseCode === code).length;

      // Count total sessions ever created for this course
      const totalSessions = await prisma.session.count({
        where: { courseCode: code }
      });

      return {
        code: code,
        attended: attendedCount,
        total: totalSessions,
        percentage: totalSessions > 0 ? Math.round((attendedCount / totalSessions) * 100) : 0
      };
    }));

    return res.json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    return res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

// --- 2. GET STUDENT HISTORY (For Detailed List) ---
export const getStudentHistory = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.profileId; 

  if (!studentId) {
    return res.status(401).json({ error: "Student profile not found" });
  }

  try {
    const history = await prisma.attendance.findMany({
      where: { studentId },
      include: {
        session: {
          select: {
            courseCode: true,
            createdAt: true,
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    });

    return res.json(history);
  } catch (error) {
    console.error("History Error:", error);
    return res.status(500).json({ error: "Failed to fetch attendance history" });
  }
};