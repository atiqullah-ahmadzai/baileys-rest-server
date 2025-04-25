/**
 * Validates an email address format
 * @param {String} email - Email address to validate
 * @returns {Boolean} - True if valid, false otherwise
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Sanitizes input to prevent basic injection attacks
 * @param {String} input - Input to sanitize
 * @returns {String} - Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .trim();
};

module.exports = {
  isValidEmail,
  sanitizeInput,
};
