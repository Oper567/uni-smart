import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// --- 1. REGISTER ---
export const register = async (req: Request, res: Response) => {
  // Destructure the new fields: department and courses
  const { email, password, name, role, staffId, matricNo, department, courses } = req.body;
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
  if (normalizedRole === 'STUDENT' && !matricNo) {
    return res.status(400).json({ error: "matricNo is required for students" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.$transaction(async (tx) => {
      // Create Base User with Department
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name,
          role: normalizedRole,
          password: hashedPassword,
          department, // 👈 Saved to User table
        },
      });

      // Create Profile
      if (normalizedRole === 'LECTURER') {
        await tx.lecturer.create({
          data: { 
            userId: user.id, 
            staffId, 
            courses // 👈 Saved to Lecturer table (e.g., ["DCOT205", "CSC101"])
          }
        });
      } else if (normalizedRole === 'STUDENT') {
        await tx.student.create({
          data: { userId: user.id, matricNo }
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
        student: { select: { id: true, matricNo: true } }, 
        lecturer: { select: { id: true, staffId: true, courses: true } } // 👈 Include courses
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
        department: user.department, // 👈 Send department to frontend
        profileId,
        courses: user.lecturer?.courses || [], // 👈 Send assigned courses to dashboard
        matricNo: user.student?.matricNo,
        staffId: user.lecturer?.staffId
      }
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};