const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validate } = require('../middleware/validator');
const { registrationRules, sendOTPRules, profileUpdateRules } = require('../middleware/authValidator');
const { upload } = require('../config/cloudinary');

const { protect } = require('../middleware/authMiddleware');

// Đăng ký
router.post(
  '/register/send-otp', 
  sendOTPRules(), 
  validate, 
  authController.sendOTP
);

router.post(
  '/register', 
  registrationRules(), 
  validate, 
  authController.register
);

// Login
router.post('/login', authController.login);

// Quên mật khẩu
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Profile
router.put('/profile', protect, profileUpdateRules(), validate, authController.updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), authController.uploadAvatar);

// Social Login
router.post('/google', authController.googleLogin);

module.exports = router;
