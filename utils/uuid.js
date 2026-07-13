/**
 * UUID to/from BINARY(16) conversion utilities.
 * MySQL stores UUIDs as BINARY(16) via UUID_TO_BIN/BIN_TO_UUID.
 */
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4 string.
 * @returns {string} UUID string
 */
export function generateUUID() {
  return uuidv4();
}

/**
 * Convert a UUID string to a Buffer for MySQL BINARY(16) storage.
 * @param {string} uuid - UUID string
 * @returns {Buffer} 16-byte buffer
 */
export function uuidToBuffer(uuid) {
  if (!uuid) return null;
  if (Buffer.isBuffer(uuid)) return uuid;
  return Buffer.from(uuid.replace(/-/g, ''), 'hex');
}

/**
 * Convert a MySQL BINARY(16) buffer back to a UUID string.
 * @param {Buffer} buffer - 16-byte buffer
 * @returns {string} UUID string
 */
export function bufferToUuid(buffer) {
  if (!buffer) return null;
  if (typeof buffer === 'string') return buffer;
  const hex = buffer.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Convert all BINARY(16) fields in a row object to UUID strings.
 * @param {Object} row - Database row
 * @param {string[]} fields - Array of field names to convert
 * @returns {Object} Row with UUID strings
 */
export function convertRow(row, fields) {
  if (!row) return null;
  const converted = { ...row };
  for (const field of fields) {
    if (field in converted && converted[field] !== null) {
      converted[field] = bufferToUuid(converted[field]);
    }
  }
  return converted;
}
