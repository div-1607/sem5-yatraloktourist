/**
 * Helper utilities for YatraLok Backend
 */

/**
 * Standardized API response helper
 */
const sendResponse = (res, statusCode, success, message, data = null, extra = {}) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(statusCode).json({ ...response, ...extra });
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Generate a random alphanumeric string
 */
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to human-readable string
 */
const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Calculate time difference in human-readable format
 */
const timeSince = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

/**
 * Sanitize user input (basic XSS prevention)
 */
const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Slugify a string
 */
const slugify = (str) => {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

/**
 * Deep clone an object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Get client IP from request
 */
const getClientIP = (req) => {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
};

/**
 * Parse boolean from query string
 */
const parseBool = (value) => {
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return undefined;
};

/**
 * Build MongoDB pagination object
 */
const buildPagination = (page, limit, total) => ({
  currentPage: parseInt(page) || 1,
  totalPages: Math.ceil(total / (parseInt(limit) || 20)),
  totalItems: total,
  perPage: parseInt(limit) || 20,
  hasNextPage: parseInt(page) < Math.ceil(total / (parseInt(limit) || 20)),
  hasPrevPage: parseInt(page) > 1,
});

module.exports = {
  sendResponse,
  asyncHandler,
  generateRandomString,
  formatDate,
  timeSince,
  sanitizeInput,
  slugify,
  deepClone,
  getClientIP,
  parseBool,
  buildPagination,
};
