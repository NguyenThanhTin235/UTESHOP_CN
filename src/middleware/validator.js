const { validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = {};
  errors.array().forEach(err => {
    extractedErrors[err.path] = err.msg;
  });

  return res.status(422).json({
    success: false,
    code: 422,
    message: 'Invalid data',
    data: null,
    errors: extractedErrors,
    timestamp: Math.floor(Date.now() / 1000)
  });
};

module.exports = { validate };
