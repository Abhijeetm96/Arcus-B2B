/**
 * @file db.ts
 * @description Manages database connections and fallback file-based storage.
 * Establishes connection pool for PostgreSQL if DATABASE_URL env variable exists,
 * or defaults to in-memory/JSON file fallback storage.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

/**
 * Absolute path to the fallback data directory.
 */
export const DB_DIR = path.join(__dirname, '..', '..', 'data');

/**
 * Absolute path to the fallback JSON database file.
 */
export const DB_FILE = path.join(DB_DIR, 'db.json');

/**
 * PostgreSQL connection pool instance. Will be null if using JSON fallback mode.
 */
export let pgPool: Pool | null = null;

/**
 * Flag indicating whether PostgreSQL is being used as the active database.
 */
export let usePostgres = false;

// Establish PostgreSQL connection pool if URL is available
const connectionString = process.env.DATABASE_URL;
if (connectionString) {
  pgPool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || connectionString.includes('neon.tech') 
      ? { rejectUnauthorized: false } 
      : undefined,
  });
  pgPool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client:', err.message);
  });
  usePostgres = true;
}

/**
 * Reads and parses the fallback JSON database file.
 * @returns {Promise<any>} The parsed DB schema object.
 */
export async function readJsonDb(): Promise<any> {
  const data = await fs.promises.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

/**
 * Serializes and writes data back to the fallback JSON database file.
 * @param {any} data - The database schema object to persist.
 * @returns {Promise<void>}
 */
export async function writeJsonDb(data: any): Promise<void> {
  await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Programmatic override helper to force the active database mode.
 * @param {boolean} value - True to enable PostgreSQL, false to force JSON fallback.
 */
export function setUsePostgres(value: boolean) {
  usePostgres = value;
}

// Automatically import and trigger database initialization/migration chain on database package load
import './initDb';



