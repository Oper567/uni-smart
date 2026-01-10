import 'dotenv/config'; // 👈 This loads .env variables instantly before the code below runs
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

// Keep your debug log to confirm it's working now
console.log('--- Database Connection Debug ---');
console.log('URL exists:', !!connectionString);
console.log('---------------------------------');

if (!connectionString) {
  throw new Error("DATABASE_URL is missing! Check if .env is in the project root.");
}

const pool = new pg.Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });