/**
 * JWT sign and verify utilities.
 */
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '1h';

/**
 * Sign a JWT token for an admin user.
 * @param {Object} payload - { admin_id, email }
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify a JWT token.
 * @param {string} token - JWT token string
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
