import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { Parser } from 'json2csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import jwt from 'jsonwebtoken';

// --- 1. START SESSION (With Course Restriction) ---
export const startSession = async (req: AuthRequest, res: Response) => {
  const { courseCode } = req.body;
  const profileId = req.user?.profileId;

  if (!courseCode) return res.status(400).json({ error: "Course code is required" });

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: profileId },
      select: { courses: true }
    });

    if (!lecturer || !lecturer.courses.includes(courseCode)) {
      return res.status(403).json({ error: `You are not authorized for course: ${courseCode}` });
    }

    const expiryTime = new Date(Date.now() + 15 * 60000); 
    const token = jwt.sign(
      { profileId, courseCode, expiresAt: expiryTime },
      process.env.QR_SECRET || 'fallback_qr_secret',
      { expiresIn: '15m' }
    );

    const session = await prisma.session.create({
      data: {
        courseCode,
        lecturerId: profileId!,
        qrCode: token,
        endTime: expiryTime,
        isActive: true
      }
    });

    res.status(201).json({ token: session.qrCode, sessionId: session.id, expiresAt: expiryTime });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize session" });
  }
};

// --- 2. GET SESSION ATTENDANCE COUNT (For Real-time Dashboard) ---
export const getSessionCount = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const count = await prisma.attendance.count({
      where: { sessionId }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
};

// --- 3. GET LECTURER SESSIONS (For Dashboard Table) ---
export const getLecturerSessions = async (req: Request, res: Response) => {
  const { lecturerId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch session history" });
  }
};

// --- 4. EXPORT ATTENDANCE CSV ---
export const exportAttendanceCSV = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: { include: { user: true } },
        session: true
      }
    });

    const data = attendance.map(rec => ({
      "Student Name": rec.student.user.name,
      "Matric No": rec.student.matricNo,
      "Department": rec.student.user.department,
      "Course": rec.session.courseCode,
      "Time In": rec.timestamp.toLocaleString(),
      "Status": rec.status
    }));

    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment(`Attendance_${sessionId}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ error: "CSV Export failed" });
  }
};

// --- 5. EXPORT ATTENDANCE PDF ---
export const exportAttendancePDF = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: {
        student: { include: { user: true } },
        session: true
      }
    });

    if (attendance.length === 0) return res.status(404).json({ error: "No records found" });

    const doc = new jsPDF() as any;
    
    // Header Style
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text("Official Attendance Report", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Course: ${attendance[0].session.courseCode}`, 14, 32);
    doc.text(`Date: ${new Date(attendance[0].session.createdAt).toLocaleDateString()}`, 14, 38);

    const tableData = attendance.map(rec => [
      rec.student.user.name,
      rec.student.matricNo,
      rec.student.user.department,
      new Date(rec.timestamp).toLocaleTimeString()
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Full Name', 'Matric Number', 'Department', 'Sign-in Time']],
      body: tableData,
      headStyles: { fillStyle: [79, 70, 229] }, // Indigo color
    });

    const pdfBuffer = doc.output('arraybuffer');
    res.header('Content-Type', 'application/pdf');
    res.attachment(`Attendance_${attendance[0].session.courseCode}.pdf`);
    return res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(500).json({ error: "PDF Export failed" });
  }
};