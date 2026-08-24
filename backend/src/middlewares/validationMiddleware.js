const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    const firstMessage = formattedErrors[0]?.message || 'Validation failed';
    throw new ApiError(400, firstMessage, formattedErrors);
  }
  next();
};

module.exports = validate;
