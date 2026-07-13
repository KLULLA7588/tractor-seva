/**
 * Authentication controller.
 * Handles admin login and JWT token issuance.
 */
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { signToken } from '../utils/jwt.js';
import { bufferToUuid } from '../utils/uuid.js';
import { validateRequired, validateEmail } from '../utils/validators.js';
import { UnauthorizedError } from '../utils/errors.js';

/**
 * POST /api/auth/login
 * Authenticate admin user and return JWT token.
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    validateRequired(req.body, ['email', 'password']);
    validateEmail(email);

    const [rows] = await pool.query(
      'SELECT id, email, password_hash FROM admin_users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password_hash);

    if (!isMatch) {
      throw new UnauthorizedError('INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const adminId = bufferToUuid(admin.id);
    const token = signToken({ admin_id: adminId, email: admin.email });

    res.json({
      success: true,
      token,
      admin: {
        id: adminId,
        email: admin.email,
      },
    });
  } catch (err) {
    next(err);
  }
}
