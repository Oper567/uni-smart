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

  if (!courseCode)
    return res.status(400).json({ error: "Course code is required" });

  try {
    const lecturer = await prisma.lecturer.findUnique({
      where: { id: profileId },
      select: { courses: true },
    });

    if (!lecturer || !lecturer.courses.includes(courseCode)) {
      return res
        .status(403)
        .json({ error: `Not authorized for course: ${courseCode}` });
    }

    const expiryTime = new Date(Date.now() + 15 * 60000); // 15 Minute window

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

    const updatedSession = await prisma.session.update({
      where: { id: session.id },
      data: { qrCode: token },
    });

    res.status(201).json({
      token: updatedSession.qrCode,
      sessionId: session.id,
      expiresAt: expiryTime,
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
      data: { isActive: false },
    });
    res.json({ message: "Session closed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to close session" });
  }
};

// --- 3. GET LECTURER SESSIONS ---
export const getLecturerSessions = async (req: Request, res: Response) => {
  const { lecturerId } = req.params;
  try {
    const sessions = await prisma.session.findMany({
      where: { lecturerId },
      include: {
        _count: {
          select: { attendance: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Fetch sessions error:", error);
    res.status(500).json({ error: "Failed to fetch session history" });
  }
};

// --- 4. GET ATTENDANCE COUNT (POLLING ENDPOINT) ---
export const getSessionCount = async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  try {
    const count = await prisma.attendance.count({
      where: { sessionId },
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
      include: { student: { include: { user: true } }, session: true },
    });

    if (attendance.length === 0)
      return res.status(404).json({ error: "No records to export" });

    const data = attendance.map((rec) => ({
      "Student Name": rec.student.user.name,
      "Matric No": rec.student.matricNo,
      Department: rec.student.user.department,
      "Time In": rec.timestamp.toLocaleString(),
    }));

    const csv = new Parser().parse(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_${attendance[0].session.courseCode}.csv`
    );
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

    if (attendance.length === 0)
      return res.status(404).json({ error: "No student records found" });

    const doc = new jsPDF();

    // PDF Styling (Electric Blue Theme)
    doc.setFontSize(20);
    doc.setTextColor(37, 99, 235); // Blue-600
    doc.text(`Attendance Report: ${attendance[0].session.courseCode}`, 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Students Present: ${attendance.length}`, 14, 36);

    const tableData = attendance.map((rec) => [
      rec.student.user.name,
      rec.student.matricNo,
      rec.student.user.department,
      new Date(rec.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [["Full Name", "Matric Number", "Department", "Sign-in Time"]],
      body: tableData,
      headStyles: { fillColor: [37, 99, 235], fontSize: 11, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      margin: { top: 45 },
    });

    const pdfOutput = doc.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfOutput);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attendance_${attendance[0].session.courseCode}.pdf`
    );
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("PDF Generation Error:", error);
    res.status(500).json({ error: "PDF Export failed on server" });
  }
};

// --- 7. MARK ATTENDANCE (STUDENT) ---
export const markAttendance = async (req: AuthRequest, res: Response) => {
  const { token } = req.body;
  const studentId = req.user?.profileId;

  if (!token) return res.status(400).json({ error: "QR Token is required" });

  try {
    // 1. Verify and Decode Token
    const decoded: any = jwt.verify(
      token,
      process.env.QR_SECRET || "fallback_qr_secret"
    );
    const { sessionId, courseCode } = decoded;

    // 2. Check Session Validity
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || !session.isActive) {
      return res
        .status(400)
        .json({ error: "This session is no longer active." });
    }

    // 3. Mark Attendance (Atomic operation with unique constraint)
    await prisma.attendance.upsert({
      where: {
        studentId_sessionId: {
          studentId: studentId!,
          sessionId: sessionId,
        },
      },
      update: {}, 
      create: {
        studentId: studentId!,
        sessionId: sessionId,
      },
    });

    // 4. Calculate Attendance Health
    const totalCourseSessions = await prisma.session.count({
      where: { courseCode: courseCode },
    });

    const studentAttendedCount = await prisma.attendance.count({
      where: {
        studentId: studentId!,
        session: { courseCode: courseCode },
      },
    });

    const percentage = Math.round((studentAttendedCount / totalCourseSessions) * 100);

    return res.status(200).json({
      message: "Success",
      courseCode,
      percentage,
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    return res
      .status(401)
      .json({ error: "Invalid or expired attendance token." });
  }
};