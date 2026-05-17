const { body, validationResult } = require('express-validator');
const response = require('../utils/response');

/**
 * ValidationMiddleware - validateRequired(email, password)
 * Kiểm tra dữ liệu đầu vào cho đăng nhập.
 */
const loginRules = [
  body('email')
    .notEmpty().withMessage('Email không được bỏ trống')
    .isEmail().withMessage('Email không đúng định dạng'),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được bỏ trống')
];

/**
 * Middleware xử lý kết quả validation.
 * Convention: 422 + errors là object { field: message }
 */
const handleValidation = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    // Convention §4: errors là object { field: "message" }
    const errors = {};
    result.array().forEach(e => {
      if (!errors[e.path]) errors[e.path] = e.msg;
    });

    return response.error(res, {
      statusCode: 422,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }
  next();
};

module.exports = { loginRules, handleValidation };
