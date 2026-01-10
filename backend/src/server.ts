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
// ✅ FIXED: Using 'authenticate' instead of 'authenticateJWT'
import { authenticate, authorizeRole } from './middlewares/auth.middleware.js';
import { prisma } from './lib/prisma.js';

const app = express();

// 4. MIDDLEWARE
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5001", "ws://localhost:5501"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  }
}));

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);

// Attendance Route
// ✅ FIXED: Updated function call here as well
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
    ✅ Server running on http://localhost:${PORT}
    🐘 Database: Supabase PostgreSQL (Prisma 7)
    🔐 Security: JWT + Role-based Access Active (Helmet Enabled)
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