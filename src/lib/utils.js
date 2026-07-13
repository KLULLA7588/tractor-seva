/**
 * Format a date string (ISO or MySQL timestamp) into a readable format.
 * @param {string} dateString - ISO or MySQL timestamp
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatDate(dateString, includeTime = false) {
  if (!dateString) return '-';
  const date = new Date(dateString.replace(' ', 'T'));
  if (isNaN(date.getTime())) return '-';

  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  if (includeTime) {
    opts.hour = '2-digit';
    opts.minute = '2-digit';
  }
  return date.toLocaleDateString('en-US', opts);
}

/**
 * Truncate text to a max length with ellipsis.
 * @param {string} text - Input text
 * @param {number} max - Max length
 * @returns {string} Truncated text
 */
export function truncate(text, max = 50) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '...' : text;
}

/**
 * Build a full image URL from a relative path.
 * @param {string} path - Relative path like "/uploads/diagrams/abc.jpg"
 * @returns {string} Full URL
 */
export function imageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${baseUrl}${path}`;
}

/**
 * Format a phone number for display (10-digit Indian format).
 * @param {string} phone - Raw phone number
 * @returns {string} Formatted phone
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

/**
 * Get initials from a name.
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
