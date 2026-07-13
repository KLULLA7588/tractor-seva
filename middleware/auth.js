/**
 * JWT authentication middleware.
 * Verifies the Authorization: Bearer <token> header on protected routes.
 */
import { verifyToken } from '../utils/jwt.js';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_MISSING',
      message: 'Token missing or invalid',
      statusCode: 401,
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'TOKEN_INVALID',
      message: 'Token missing or invalid',
      statusCode: 401,
    });
  }
}
