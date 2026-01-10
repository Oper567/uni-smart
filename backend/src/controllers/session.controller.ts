import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import { Parser } from 'json2csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import jwt from 'jsonwebtoken';

// --- 1. START SESSION ---
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
      return res.status(403).json({ error: `Not authorized for course: ${courseCode}` });
    }

    const expiryTime = new Date(Date.now() + 15 * 60000); 

    const session = await prisma.session.create({
      data: {
        courseCode,
        lecturerId: profileId!,
        qrCode: "", 
        endTime: expiryTime,
        isActive: true
      }
    });

    const token = jwt.sign(
      { sessionId: session.id, lecturerId: profileId, courseCode },
      process.env.QR_SECRET || 'fallback_qr_secret',
      { expiresIn: '15m' }
    );

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: { qrCode: token }
    });

    res.status(201).json({ 
      token: updatedSession.qrCode, 
      sessionId: session.id, 
      expiresAt: expiryTime 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize session" });
  }
};

// --- 2. CLOSE SESSION MANUALLY ---
export const closeSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false }
    });
    res.json({ message: "Session closed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to close session" });
  }
};

// --- 3. GET LECTURER SESSIONS (THE MISSING FUNCTION) ---
export const getLecturerSessions = async (req: Request, res: Response) => {
  const { lecturerId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(sessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    res.status(500).json({ error: "Failed to fetch session history" });
  }
};

// --- 4. GET ATTENDANCE COUNT ---
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

// --- 5. EXPORT CSV ---
export const exportAttendanceCSV = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: { student: { include: { user: true } }, session: true }
    });

    if (attendance.length === 0) return res.status(404).json({ error: "No records to export" });

    const data = attendance.map(rec => ({
      "Student Name": rec.student.user.name,
      "Matric No": rec.student.matricNo,
      "Department": rec.student.user.department,
      "Time In": rec.timestamp.toLocaleString(),
    }));

    const csv = new Parser().parse(data);
    res.header('Content-Type', 'text/csv');
    res.attachment(`Attendance_${attendance[0].session.courseCode}.csv`);
    return res.send(csv);
  } catch (error) {
    res.status(500).json({ error: "CSV Export failed" });
  }
};

// --- 6. EXPORT PDF ---
export const exportAttendancePDF = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: { student: { include: { user: true } }, session: true },
      orderBy: { student: { user: { name: 'asc' } } }
    });

    if (attendance.length === 0) return res.status(404).json({ error: "No records found" });

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Attendance: ${attendance[0].session.courseCode}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(attendance[0].session.createdAt).toLocaleDateString()}`, 14, 28);

    const tableData = attendance.map(rec => [
      rec.student.user.name,
      rec.student.matricNo,
      rec.student.user.department,
      new Date(rec.timestamp).toLocaleTimeString()
    ]);

    (doc as any).autoTable({
      startY: 35,
      head: [['Full Name', 'Matric Number', 'Department', 'Sign-in Time']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
    });

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${attendance[0].session.courseCode}.pdf`);
    return res.end(pdfBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "PDF Export failed" });
  }
};