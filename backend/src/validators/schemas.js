const { body, param, query } = require('express-validator');
const Organization = require('../models/Organization');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Owner name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const createOrgValidator = [
  body('name').trim().notEmpty().withMessage('Organization name is required').isLength({ max: 120 }),
  body('category').optional().isIn(Organization.CATEGORIES).withMessage('Invalid organization category'),
  body('description').optional().isLength({ max: 500 }),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
];

const updateOrgValidator = [
  param('organizationId').isMongoId().withMessage('Invalid organization ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 120 }),
  body('category').optional().isIn(Organization.CATEGORIES).withMessage('Invalid organization category'),
  body('description').optional().isLength({ max: 500 }),
  body('phone').optional().trim(),
  body('city').optional().trim(),
  body('address').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const createServiceValidator = [
  param('organizationId').isMongoId().withMessage('Invalid organization ID'),
  body('name').trim().notEmpty().withMessage('Service name is required').isLength({ max: 100 }),
  body('ticketPrefix')
    .trim()
    .notEmpty()
    .withMessage('Ticket prefix is required')
    .isLength({ min: 1, max: 5 })
    .matches(/^[A-Z0-9]+$/i)
    .withMessage('Ticket prefix must be alphanumeric'),
  body('averageServiceTime')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Average service time must be between 1 and 300 minutes'),
  body('description').optional().isLength({ max: 300 }),
];

const updateServiceValidator = [
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  body('name').optional().trim().notEmpty().withMessage('Service name cannot be empty').isLength({ max: 100 }),
  body('ticketPrefix')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5 })
    .matches(/^[A-Z0-9]+$/i)
    .withMessage('Ticket prefix must be alphanumeric'),
  body('averageServiceTime')
    .optional()
    .isInt({ min: 1, max: 300 })
    .withMessage('Average service time must be between 1 and 300 minutes'),
  body('description').optional().isLength({ max: 300 }),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const joinQueueValidator = [
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  body('name').trim().notEmpty().withMessage('Customer name is required').isLength({ max: 100 }),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Customer phone is required')
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 digits'),
];

const publicTokenValidator = [
  param('publicToken').trim().notEmpty().withMessage('Public ticket token is required'),
];

const mongoIdParamValidator = (paramName) => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];

module.exports = {
  registerValidator,
  loginValidator,
  createOrgValidator,
  updateOrgValidator,
  createServiceValidator,
  updateServiceValidator,
  joinQueueValidator,
  publicTokenValidator,
  mongoIdParamValidator,
};
