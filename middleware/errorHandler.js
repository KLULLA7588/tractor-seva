/**
 * Global error handling middleware.
 * Must be registered last in the Express middleware stack.
 */
import { AppError } from '../utils/errors.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    statusCode: 404,
  });
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.code,
      message: err.message,
      statusCode: err.statusCode,
    });
  }

  // MySQL duplicate entry error
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'CONFLICT',
      message: 'A record with this value already exists',
      statusCode: 409,
    });
  }

  // MySQL foreign key constraint error
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_INPUT',
      message: 'Referenced record does not exist',
      statusCode: 400,
    });
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'INVALID_FILE',
      message: 'File size exceeds the maximum allowed limit',
      statusCode: 400,
    });
  }

  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}
