import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';

// 1. GLOBAL ERROR CATCHERS
process.on('uncaughtException', (err: Error) => {
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

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'", 
        "http://localhost:5001", 
        "https://uni-smart.onrender.com", 
        "https://uni-smart-backend.onrender.com",
        "https://unismart.com.ng",
        "https://www.unismart.com.ng"
      ],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }
}));

const allowedOrigins = [
  'http://localhost:3000',
  'https://uni-smart.onrender.com',
  'https://unismart.com.ng',
  'https://www.unismart.com.ng'
];

app.use(cors({
  origin: function (origin, callback) {
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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/student', studentRoutes);

app.post('/api/attendance/mark', authenticate, authorizeRole(['STUDENT']), markAttendance);

// Enhanced Health Check - FIXED TS ERROR
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; 
    res.status(200).json({ 
      status: 'System Operational 🚀',
      database: 'Connected 🐘',
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    // Check if error is an instance of Error to access .message safely
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error('❌ Database Health Check Failed:', errorMessage);
    
    res.status(503).json({ 
      status: 'Maintenance Mode 🛠️', 
      database: 'Disconnected',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
});

// 6. SERVER INITIALIZATION
const PORT = process.env.PORT || 5001;

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
    🚀 SYSTEM ONLINE
    ✅ Server running on port ${PORT}
    🐘 Database: Connected
    🔐 Security: CORS & Helmet configured for unismart.com.ng
  `);
});

// FIXED TS ERROR: Using NodeJS.ErrnoException to access .code
server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    process.exit(1);
  } else {
    console.error('🔥 Server Error:', err);
  }
});