const { body } = require('express-validator');

const registrationRules = () => {
  return [
    body('full_name')
      .notEmpty().withMessage('Full name is required')
      .isLength({ min: 2 }).withMessage('Full name must be at least 2 characters'),
    
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format'),
    
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage('Password must include uppercase, lowercase, numbers, and special characters'),
    
    body('otp_code')
      .notEmpty().withMessage('OTP code is required')
      .isLength({ min: 6, max: 6 }).withMessage('OTP code must be exactly 6 digits')
      .isNumeric().withMessage('OTP code must be numeric')
  ];
};

const sendOTPRules = () => {
  return [
    body('email')
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Invalid email format')
  ];
};

module.exports = {
  registrationRules,
  sendOTPRules
};
