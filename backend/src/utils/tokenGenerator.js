const crypto = require('crypto');

const generatePublicToken = () => {
  return 'qtk_' + crypto.randomBytes(16).toString('hex');
};

const formatTicketNumber = (servicePrefix = 'A', sequenceNumber = 1) => {
  const padded = String(sequenceNumber).padStart(3, '0');
  const cleanPrefix = (servicePrefix || 'A').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'A';
  return `${cleanPrefix}-${padded}`;
};

module.exports = {
  generatePublicToken,
  formatTicketNumber,
};
