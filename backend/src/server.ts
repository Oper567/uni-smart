import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';


// 1. GLOBAL ERROR CATCHERS
process.on('uncaughtException', (err) => {
  console.error('🔥 CRITICAL STARTUP ERROR:', err.message);
  process.exit(1);
});

// 2. LOAD ENV
dotenv.config();

// 3. IMPORTS
import authRoutes from './routes/auth.routes.js';
import sessionRoutes from './routes/session.routes.js';
import { markAttendance } from './controllers/attendance.controller.js';
import { authenticate, authorizeRole } from './middlewares/auth.middleware.js';
import { prisma } from './lib/prisma.js';
import studentRoutes from './routes/student.routes.js';

const app = express();

// 4. MIDDLEWARE

// Updated Helmet for Production
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Added your Render URLs to the allowed connect sources
      connectSrc: [
        "'self'", 
        "http://localhost:5001", 
        "https://uni-smart.onrender.com", 
        "https://uni-smart-backend.onrender.com"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }
}));

// ✅ FIXED CORS: Allowing both local and production URLs
const allowedOrigins = [
  'http://localhost:3000',
  'https://uni-smart.onrender.com' // Your frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS Blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/student', studentRoutes);

// Attendance Route
app.post('/api/attendance/mark', authenticate, authorizeRole(['STUDENT']), markAttendance);

// Enhanced Health Check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; 
    res.status(200).json({ 
      status: 'System Operational 🚀',
      database: 'Connected 🐘',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Database Health Check Failed:', error.message);
    res.status(503).json({ 
      status: 'Maintenance Mode 🛠️', 
      database: 'Disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 6. SERVER INITIALIZATION
const PORT = process.env.PORT || 5001;

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
    🚀 SYSTEM ONLINE
    ✅ Server running on port ${PORT}
    🐘 Database: Supabase PostgreSQL
    🔐 Security: CORS Updated for Production
  `);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('🔥 Server Error:', err);
  }
});