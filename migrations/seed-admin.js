/**
 * Seed script to create the default admin user.
 * Run with: npm run seed
 *
 * Default credentials:
 *   Email: admin@example.com
 *   Password: admin123
 *
 * You can override these via env vars: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateUUID, uuidToBuffer } from '../utils/uuid.js';

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  console.log(`Creating admin user: ${email}`);

  // Check if admin already exists
  const [existing] = await pool.query(
    'SELECT id FROM admin_users WHERE email = ?',
    [email]
  );

  if (existing.length > 0) {
    console.log('Admin user already exists. Skipping seed.');
    await pool.end();
    return;
  }

  const id = generateUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    'INSERT INTO admin_users (id, email, password_hash) VALUES (?, ?, ?)',
    [uuidToBuffer(id), email, passwordHash]
  );

  console.log('Admin user created successfully.');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log('');
  console.log('You can now login at POST /api/auth/login');

  await pool.end();
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
