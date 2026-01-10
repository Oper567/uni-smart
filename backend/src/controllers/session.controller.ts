import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import { Parser } from "json2csv";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import jwt from "jsonwebtoken";

// --- 1. START SESSION ---
export const startSession = async (req: AuthRequest, res: Response) => {
  const { courseCode } = req.body;
  const profileId = req.user?.profileId;

  if (!courseCode) return res.status(400).json({ error: "Course code is required" });

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: profileId },
      select: { courses: true },
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
        isActive: true,
      },
    });

    const token = jwt.sign(
      { sessionId: session.id, lecturerId: profileId, courseCode },
      process.env.QR_SECRET || "fallback_qr_secret",
      { expiresIn: "15m" }
    );

    await prisma.session.update({
      where: { id: session.id },
      data: { qrCode: token },
    });

    res.status(201).json({
      token,
      sessionId: session.id,
      expiresAt: expiryTime,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to initialize session" });
  }
};

// --- 2. CLOSE SESSION ---
export const closeSession = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  try {
    await prisma.session.update({
      where: { id: sessionId },
      data: { isActive: false },
    });
    res.json({ message: "Session closed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to close session" });
  }
};

// --- 3. GET LECTURER SESSIONS (MISSING MEMBER FIX) ---
export const getLecturerSessions = async (req: Request, res: Response) => {
  const { lecturerId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      orderBy: { createdAt: "desc" },
    });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
};

// --- 4. GET SESSION COUNT ---
export const getSessionCount = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const count = await prisma.attendance.count({ where: { sessionId } });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch count" });
  }
};

// --- 5. EXPORT CSV (MISSING MEMBER FIX) ---
export const exportAttendanceCSV = async (req: AuthRequest, res: Response) => {
  const { sessionId } = req.params;
  try {
    const attendance = await prisma.attendance.findMany({
      where: { sessionId },
      include: { student: { include: { user: true } }, session: true },
    });

    if (attendance.length === 0) return res.status(404).json({ error: "No records" });

    const data = attendance.map((rec) => ({
      "Student Name": rec.student.user.name,
      "Matric No": rec.student.matricNo,
      Department: rec.student.user.department,
      "Time In": rec.timestamp.toLocaleString(),
    }));

    const csv = new Parser().parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=Attendance.csv`);
    return res.status(200).send(csv);
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
      orderBy: { student: { user: { name: "asc" } } },
    });

    if (attendance.length === 0) return res.status(404).json({ error: "No student records found" });

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235);
    doc.text(`Attendance Report: ${attendance[0].session.courseCode}`, 14, 22);

    const tableData = attendance.map((rec) => [
      rec.student.user.name,
      rec.student.matricNo,
      rec.student.user.department,
      new Date(rec.timestamp).toLocaleTimeString(),
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [["Full Name", "Matric Number", "Department", "Sign-in Time"]],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235] },
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Attendance.pdf`);
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ error: "PDF Export failed" });
  }
};

// --- 7. MARK ATTENDANCE (STUDENT) ---
export const markAttendance = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  const studentId = req.user?.profileId;

  try {
    const decoded: any = jwt.verify(token, process.env.QR_SECRET || "fallback_qr_secret");
    const { sessionId, courseCode } = decoded;

    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session || !session.isActive) return res.status(400).json({ error: "Session expired" });

    await prisma.attendance.upsert({
      where: { sessionId_studentId: { sessionId, studentId: studentId! } },
      update: {}, 
      create: { studentId: studentId!, sessionId },
    });

    const total = await prisma.session.count({ where: { courseCode } });
    const attended = await prisma.attendance.count({
      where: { studentId: studentId!, session: { courseCode } },
    });

    return res.status(200).json({
      courseCode,
      percentage: Math.round((attended / total) * 100),
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

// --- 8. STUDENT STATS ---
export const getStudentStats = async (req: AuthRequest, res: Response) => {
  const studentId = req.user?.profileId;
  try {
    const sessions = await prisma.session.findMany({
      distinct: ['courseCode'],
      select: { courseCode: true }
    });

    const stats = await Promise.all(sessions.map(async (s) => {
      const total = await prisma.session.count({ where: { courseCode: s.courseCode } });
      const attended = await prisma.attendance.count({
        where: { studentId: studentId!, session: { courseCode: s.courseCode } }
      });
      return { code: s.courseCode, attended, total, percentage: total > 0 ? Math.round((attended / total) * 100) : 0 };
    }));
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed stats" });
  }
};