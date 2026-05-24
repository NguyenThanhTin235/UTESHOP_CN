const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const User = require('../models/User');
const OTP = require('../models/OTP');
const Notification = require('../models/Notification');
const authService = require('../services/authService');
const responseHelper = require('../utils/responseHelper');
const response = require('../utils/response');
const { toCamelCase } = require('../utils/formatter');

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
    
    const result = await authService.authenticate(email, password, ipAddress, deviceInfo);

    if (result.require2Fa) {
      return response.success(res, {
        statusCode: 200,
        message: '2FA verification code required',
        data: {
          require2Fa: true,
          email: result.email
        }
      });
    }

    // Gửi thông báo đăng nhập mới
    try {
      const io = req.app.get('socketio');
      if (io && result.user) {
        io.to(result.user.id).emit('notification', {
          title: 'Đăng nhập mới',
          message: 'Tài khoản của bạn vừa được đăng nhập thành công.'
        });
      }
    } catch (e) {
      console.log('Socket notification failed');
    }

    return response.success(res, {
      statusCode: 200,
      message: 'Đăng nhập thành công',
      data: {
        token: result.token,
        user: toCamelCase(result.user),
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
 * Xác thực mã OTP 2FA để đăng nhập
 */
exports.verify2FA = async (req, res) => {
  try {
    const { email, otpCode } = req.body;
    if (!email || !otpCode) {
      return response.error(res, {
        statusCode: 422,
        message: 'Please provide email and OTP code'
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    const result = await authService.verify2FA(email, otpCode, ipAddress, deviceInfo);

    // Gửi thông báo đăng nhập mới
    try {
      const io = req.app.get('socketio');
      if (io && result.user) {
        io.to(result.user.id).emit('notification', {
          title: 'New Login Detected',
          message: 'Your account has been successfully logged in.'
        });
      }
    } catch (e) {
      console.log('Socket notification failed');
    }

    return response.success(res, {
      statusCode: 200,
      message: 'Login successful',
      data: {
        token: result.token,
        user: toCamelCase(result.user),
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

    // Gửi thông báo chào mừng
    try {
      await Notification.create({
        user_id: result.user._id,
        title: 'Welcome to UTEShop!',
        content: 'Thank you for registering. Explore our premium academic collections now!',
        detailContent: `Hello ${result.user.full_name},\n\nWelcome to UTEShop, the premium academic shopping platform. We are committed to providing a modern, accurate, and high-quality shopping experience.\n\nDon't forget to complete your profile and explore exclusive vouchers for new members!`,
        type: 'system',
        category: 'System',
        date: 'JUST NOW',
        link: '/search'
      });
    } catch (notifErr) {
      console.error('Notification Error on Register:', notifErr);
    }

    res.status(201).json({
      success: true,
      code: 201,
      message: 'Registration successful',
      data: toCamelCase({
        token: result.token,
        user: {
          id: result.user._id,
          fullName: result.user.full_name,
          email: result.user.email,
          role: result.user.role,
          avatarUrl: result.user.avatar_url || null
        }
      }),
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

    // Gửi thông báo đổi mật khẩu thành công
    try {
      await Notification.create({
        user_id: user._id,
        title: 'Password Reset Successful',
        content: 'Your account password has been successfully reset.',
        detailContent: `The password for account ${user.email} was successfully changed via the Forgot Password feature.\n\n**Time:** ${new Date().toLocaleString('en-US')}\n\nIf you did not make this request, please contact UTEShop support immediately.`,
        type: 'system',
        category: 'System',
        date: 'JUST NOW',
        link: '/profile'
      });
    } catch (notifErr) {
      console.error('Notification Error on Reset Password:', notifErr);
    }

    // Gửi email cảnh báo thay đổi mật khẩu (nếu bật tùy chọn)
    if (user.security_alerts?.password_changes !== false) {
      const sendEmail = require('../utils/mail');
      const { getAlertTemplate } = require('../utils/emailTemplates');
      const message = `Hello ${user.full_name},\n\nYour UTEShop account password was successfully reset. If you did not request this change, please secure your account immediately.\n\nBest regards,\nUTEShop Support Team`;
      const html = getAlertTemplate(
        'Password Reset Successful',
        `Hello ${user.full_name}, the password for your UTEShop account was successfully reset.`,
        [
          { label: 'Date/Time', value: new Date().toLocaleString('en-US') },
          { label: 'Status', value: 'Completed Successfully' }
        ],
        'green',
        false
      );

      sendEmail({
        email: user.email,
        subject: '[UTEShop] Security Alert: Password Reset Successful',
        message,
        html
      }).catch(err => console.error('Failed to send password reset success email:', err));
    }

    return responseHelper.successResponse(res, 'Password has been updated successfully');
  } catch (error) {
    console.error('Reset Password Error:', error);
    return responseHelper.errorResponse(res, 'Internal Server Error', 500);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, dob, gender } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return response.error(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    if (fullName) user.full_name = fullName;
    if (phone) user.phone = phone;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    const updatedUser = await user.save();

    return response.success(res, {
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          avatar_url: updatedUser.avatar_url,
          phone: updatedUser.phone,
          dob: updatedUser.dob,
          gender: updatedUser.gender,
          role: updatedUser.role,
        }
      }
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    return response.error(res, {
      statusCode: 500,
      message: 'Server error while updating profile',
    });
  }
};

/**
 * @desc    Upload user avatar
 * @route   POST /api/auth/profile/avatar
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return response.error(res, {
        statusCode: 400,
        message: 'Please upload an image file',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return response.error(res, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    // Update avatar URL
    user.avatar_url = req.file.path;
    await user.save();

    return response.success(res, {
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: req.file.path,
        user: {
          id: user._id,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender,
          role: user.role
        }
      }
    });
  } catch (err) {
    console.error('Upload Avatar Error:', err);
    return response.error(res, {
      statusCode: 500,
      message: 'Server error while uploading avatar',
    });
  }
};

/**
 * @desc    Google Social Login
 * @route   POST /api/auth/google
 */
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body; // access_token from frontend

    // Fetch user info using the access token
    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenId}`);
    const { email, name, picture, sub } = googleRes.data;

    if (!email) {
      return response.error(res, {
        statusCode: 400,
        message: 'Google account does not provide email',
      });
    }

    const ipAddress = req.ip || req.connection.remoteAddress;
    const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

    const result = await authService.socialAuthenticate({
      email,
      full_name: name,
      avatar_url: picture,
      provider: 'google',
      provider_id: sub
    }, ipAddress, deviceInfo);

    // Gửi thông báo đăng nhập Google thành công
    try {
      await Notification.create({
        user_id: result.user._id,
        title: 'Google Login Successful',
        content: `Account ${result.user.email} was logged in via Google.`,
        detailContent: `We detected a new login to your UTEShop account via Google Authentication (OAuth2).\n\n**Account:** ${result.user.email}\n**Time:** ${new Date().toLocaleString('en-US')}\n\nIf this was you, you can ignore this alert.`,
        type: 'system',
        category: 'System',
        date: 'JUST NOW',
        link: '/profile'
      });
    } catch (notifErr) {
      console.error('Notification Error on Google Login:', notifErr);
    }

    return response.success(res, {
      message: 'Google login successful',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  } catch (error) {
    console.error('Google Login Error:', error.response?.data || error.message);
    return response.error(res, {
      statusCode: 401,
      message: 'Google authentication failed',
    });
  }
};
