const User = require('../models/User');
const OTP = require('../models/OTP');
const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');
const response = require('../utils/response');

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.authenticate(email, password);

    return response.success(res, {
      message: 'Login successful',
      data: {
        token: result.token,
        user: result.user,
        redirectUrl: result.redirectUrl
      }
    });
  } catch (err) {
    return response.error(res, {
      statusCode: 401,
      message: err.message
    });
  }
};

/**
 * @desc    Send OTP for registration
 * @route   POST /api/auth/register/send-otp
 */
exports.sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    await authService.sendRegistrationOTP(email);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'OTP has been sent to your email',
      data: null,
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { full_name, email, password, otp_code } = req.body;
    const result = await authService.registerUser({
      full_name,
      email,
      password,
      otp_code
    });

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Registration successful',
      data: {
        token: result.token,
        user: {
          id: result.user._id,
          full_name: result.user.full_name,
          email: result.user.email,
          role: result.user.role
        }
      },
      timestamp: Math.floor(Date.now() / 1000)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Request Forgot Password OTP
 * @route   POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return responseHelper.errorResponse(res, 'Email is required', 422, { email: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return responseHelper.errorResponse(res, 'Email account does not exist', 422, { email: 'Email does not exist' });
    }

    const otpCode = authService.generateOTP ? authService.generateOTP() : Math.floor(100000 + Math.random() * 900000).toString();
    const expiredAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({
      email,
      otp_code: otpCode,
      otp_type: 'reset_password',
      expired_at: expiredAt
    });

    if (authService.sendOTPEmail) {
      await authService.sendOTPEmail(email, otpCode);
    }

    return responseHelper.successResponse(res, 'OTP has been sent to your email');
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return responseHelper.errorResponse(res, 'Internal Server Error', 500);
  }
};

/**
 * @desc    Reset Password using OTP
 * @route   POST /api/auth/reset-password
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const errors = {};
    if (!email) errors.email = 'Email is required';
    if (!otp) errors.otp = 'OTP is required';
    if (!newPassword) errors.newPassword = 'New Password is required';
    
    if (Object.keys(errors).length > 0) {
      return responseHelper.errorResponse(res, 'Validation failed', 422, errors);
    }

    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return responseHelper.errorResponse(res, 'Password must be at least 8 characters, including numbers and special characters', 422, {
        newPassword: 'Password does not meet security requirements'
      });
    }

    const isValid = await authService.verifyOTP(email, otp, 'reset_password');
    if (!isValid) {
      return responseHelper.errorResponse(res, 'Invalid or expired OTP code', 422, {
        otp: 'Invalid or expired OTP'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return responseHelper.errorResponse(res, 'User not found', 404);
    }

    user.password = await authService.hashPassword(newPassword);
    await user.save();

    return responseHelper.successResponse(res, 'Password has been updated successfully');
  } catch (error) {
    console.error('Reset Password Error:', error);
    return responseHelper.errorResponse(res, 'Internal Server Error', 500);
  }
};
