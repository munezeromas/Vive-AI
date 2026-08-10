import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('Please ensure your .env file contains DATABASE_URL or set it in your environment.');
  console.error('Example: DATABASE_URL="postgresql://user:password@host/database"');
  throw new Error('DATABASE_URL must be a Neon connection string - environment variable not set');
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);
console.log('✓ Database connection initialized successfully');
