const crypto = require('crypto');

/**
 * Generate a cryptographically secure URL-friendly public token for ticket access
 */
const generatePublicToken = () => {
  return 'qtk_' + crypto.randomBytes(16).toString('hex');
};

/**
 * Format human-readable ticket number (e.g., A-001, GC-012)
 */
const formatTicketNumber = (servicePrefix = 'A', sequenceNumber = 1) => {
  const padded = String(sequenceNumber).padStart(3, '0');
  const cleanPrefix = (servicePrefix || 'A').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'A';
  return `${cleanPrefix}-${padded}`;
};

module.exports = {
  generatePublicToken,
  formatTicketNumber,
};
