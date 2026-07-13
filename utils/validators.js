/**
 * Input validation utilities.
 */
import { v4 as uuidv4 } from 'uuid';
import { ValidationError, BadRequestError } from './errors.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that a value is a valid UUID v4 string.
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @throws {BadRequestError} If UUID is invalid
 */
export function validateUUID(value, fieldName = 'id') {
  if (!value || !UUID_REGEX.test(value)) {
    throw new BadRequestError('INVALID_UUID', `${fieldName} must be a valid UUID`);
  }
}

/**
 * Validate that required fields are present in a body object.
 * @param {Object} body - Request body
 * @param {string[]} fields - Required field names
 * @throws {BadRequestError} If any required field is missing
 */
export function validateRequired(body, fields) {
  const missing = fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length > 0) {
    throw new BadRequestError('INVALID_INPUT', `Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Validate a coordinate value (0-100 percentage).
 * @param {number} value - Coordinate value
 * @param {string} fieldName - Name of the field
 * @throws {ValidationError} If coordinate is invalid
 */
export function validateCoordinate(value, fieldName) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0 || num > 100) {
    throw new ValidationError('VALIDATION_ERROR', `${fieldName} must be a number between 0 and 100`);
  }
}

/**
 * Validate email format.
 * @param {string} email - Email address
 * @throws {ValidationError} If email is invalid
 */
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new ValidationError('VALIDATION_ERROR', 'Invalid email address');
  }
}

/**
 * Validate inquiry status value.
 * @param {string} status - Status string
 * @throws {ValidationError} If status is invalid
 */
export function validateInquiryStatus(status) {
  const valid = ['New', 'Contacted', 'Resolved'];
  if (!valid.includes(status)) {
    throw new ValidationError('VALIDATION_ERROR', `Status must be one of: ${valid.join(', ')}`);
  }
}

export { UUID_REGEX };
