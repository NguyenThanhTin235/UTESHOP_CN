const { toCamelCase } = require('./formatter');

/**
 * Success Response
 */
const successResponse = (res, message, data = null, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    code: statusCode,
    message,
    data: toCamelCase(data),
    timestamp: Math.floor(Date.now() / 1000)
  });
};

/**
 * Error Response
 */
const errorResponse = (res, message, statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    code: statusCode,
    message,
    data: null,
    errors,
    timestamp: Math.floor(Date.now() / 1000)
  });
};

module.exports = {
  successResponse,
  errorResponse
};
