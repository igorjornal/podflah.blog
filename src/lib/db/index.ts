import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connStr = process.env.DATABASE_URL || process.env.STORAGE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL_UNPOOLED;
const pool = new Pool({ connectionString: connStr });
export const db = drizzle(pool, { schema });

export * from './schema';
