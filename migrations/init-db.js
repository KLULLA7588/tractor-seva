/**
 * Database initialization script.
 * Creates the tractor_seva database and all tables if they don't exist.
 * Run with: npm run db:init
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'tractor_seva';

  console.log(`Connecting to MySQL at ${host}:${port} as ${user}...`);

  // Connect without a database to create it first
  const connection = await mysql.createConnection({ host, port, user, password });

  const schemaPath = path.join(__dirname, '..', 'database-schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  // Split on semicolons followed by newline (simple splitter for this schema)
  const statements = sql
    .split(/;\s*\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    await connection.query(statement);
  }

  await connection.end();
  console.log(`Database "${database}" and all tables created successfully.`);
}

initDatabase().catch((err) => {
  console.error('Database initialization failed:', err.message);
  process.exit(1);
});
