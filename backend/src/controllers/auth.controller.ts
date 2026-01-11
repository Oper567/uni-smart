import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- 1. REGISTER ---
export const register = async (req: Request, res: Response) => {
  // 1. Destructure "level" from the request body
  const { email, password, name, role, staffId, matricNo, department, courses, level } = req.body;
  const normalizedRole = role?.toUpperCase();
  const normalizedEmail = email?.toLowerCase();

  // Basic Validation
  if (!department) return res.status(400).json({ error: "Department is required" });
  
  if (normalizedRole === 'LECTURER') {
    if (!staffId) return res.status(400).json({ error: "staffId is required for lecturers" });
    if (!courses || !Array.isArray(courses)) {
      return res.status(400).json({ error: "Assigned courses array is required for lecturers" });
    }
  }
  
  if (normalizedRole === 'STUDENT') {
    if (!matricNo) return res.status(400).json({ error: "matricNo is required for students" });
    // 2. Validate that level is provided for students
    if (!level) return res.status(400).json({ error: "Academic level is required for students" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      // Create Base User
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name,
          role: normalizedRole,
          password: hashedPassword,
          department,
        },
      });

      // Create Profile
      if (normalizedRole === 'LECTURER') {
        await tx.lecturer.create({
          data: { 
            userId: user.id, 
            staffId, 
            courses 
          }
        });
      } else if (normalizedRole === 'STUDENT') {
        // 3. Save "level" to the student table
        await tx.student.create({
          data: { 
            userId: user.id, 
            matricNo,
            level: level.toString() // Ensure it's stored as a string
          }
        });
      }
      return user;
    });

    res.status(201).json({ 
      message: "User registered successfully", 
      user: { id: newUser.id, email: newUser.email } 
    });

  } catch (error: any) {
    console.error("Registration Error:", error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "Email, Staff ID, or Matric Number already exists" });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

// --- 2. LOGIN ---
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { 
        // 4. Include "level" in the login response so the frontend can display it
        student: { select: { id: true, matricNo: true, level: true } }, 
        lecturer: { select: { id: true, staffId: true, courses: true } }
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const profileId = user.role === 'STUDENT' ? user.student?.id : user.lecturer?.id;

    const token = jwt.sign(
      { id: user.id, role: user.role, profileId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: { 
        id: user.id,
        name: user.name, 
        role: user.role, 
        department: user.department,
        profileId,
        courses: user.lecturer?.courses || [],
        matricNo: user.student?.matricNo,
        level: user.student?.level, // 5. Send level to the dashboard
        staffId: user.lecturer?.staffId
      }
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};