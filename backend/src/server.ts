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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// 5. ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/student', studentRoutes);

app.post('/api/attendance/mark', authenticate, authorizeRole(['STUDENT']), markAttendance);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; 
    res.status(200).json({ status: 'System Operational 🚀' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    res.status(503).json({ status: 'Maintenance Mode 🛠️', error: errorMessage });
  }
});

// 6. RENDER AUTO-PING HACK
const RENDER_URL = 'https://uni-smart-backend.onrender.com/health'; 

const keepAlive = () => {
  setInterval(async () => {
    try {
      const response = await fetch(RENDER_URL);
      console.log(`📡 Auto-Ping: Status ${response.status} at ${new Date().toISOString()}`);
    } catch (err) {
      console.error('📡 Auto-Ping Failed:', err);
    }
  }, 14 * 60 * 1000); // Ping every 14 minutes
};

// 7. SERVER INITIALIZATION
const PORT = process.env.PORT || 5001;

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // Start the keep-alive loop
  if (process.env.NODE_ENV === 'production') {
    keepAlive();
  }
});

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    process.exit(1);
  }
});