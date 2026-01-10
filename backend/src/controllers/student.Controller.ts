import { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getStudentHistory = async (req: AuthRequest, res: Response) => {
  // Use the profileId attached by your authenticate middleware
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