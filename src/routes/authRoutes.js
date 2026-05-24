const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validator');
const { registrationRules, sendOTPRules, profileUpdateRules } = require('../middleware/authValidator');
const { upload } = require('../config/cloudinary');

const { protect } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// Đăng ký
router.post(
  '/register/send-otp', 
  loginLimiter,
  sendOTPRules(), 
  validate, 
  authController.sendOTP
);

router.post(
  '/register', 
  loginLimiter,
  registrationRules(), 
  validate, 
  authController.register
);

// Login
router.post('/login', loginLimiter, authController.login);
router.post('/verify-2fa', loginLimiter, authController.verify2FA);

// Quên mật khẩu
router.post('/forgot-password', loginLimiter, authController.forgotPassword);
router.post('/reset-password', loginLimiter, authController.resetPassword);

// Profile
router.put('/profile', protect, profileUpdateRules(), validate, authController.updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), authController.uploadAvatar);

// Social Login
router.post('/google', authController.googleLogin);

module.exports = router;
