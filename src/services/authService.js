const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
const User = require('../models/User');
const sendEmail = require('../utils/mail');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

/**
 * Generate a 6-digit random OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash password using BCrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Verify OTP from database
 */
const verifyOTP = async (email, otpCode, type) => {
  const otpRecord = await OTP.findOne({
    email,
    otp_code: otpCode,
    otp_type: type,
    is_verified: false,
    expired_at: { $gt: new Date() }
  });

  if (!otpRecord) return false;

  // Mark as used
  otpRecord.is_verified = true;
  await otpRecord.save();
  return true;
};

/**
 * Send OTP via Email (for Forgot Password)
 */
const sendOTPEmail = async (email, otpCode) => {
  try {
    const message = `Your password reset OTP code is: ${otpCode}. It is valid for 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">Verify Your UTEShop Account</h2>
        <p>Hi there,</p>
        <p>You have requested to reset your UTEShop password. Here is your OTP code:</p>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #e74c3c; border-radius: 5px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p>This code is valid for <b>10 minutes</b>. Please do not share this code with anyone.</p>
        <p>If you did not make this request, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #7f8c8d; text-align: center;">This is an automated email, please do not reply.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: '[UTEShop] Password Reset OTP',
      message,
      html
    });
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
};

/**
 * Authenticate User (Login)
 */
const authenticate = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (user.lockout_until && new Date() < user.lockout_until) {
    const remainMinutes = Math.ceil((user.lockout_until - new Date()) / (60 * 1000));
    throw new Error(`Account temporarily locked due to too many failed attempts. Try again in ${remainMinutes} minutes`);
  }

  if (user.status === 'locked') {
    throw new Error('Account is locked. Please contact administrator');
  }
  
  if (user.status === 'inactive') {
    throw new Error('Account is disabled');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    user.failed_login_attempts += 1;
    if (user.failed_login_attempts >= MAX_FAILED_ATTEMPTS) {
      user.lockout_until = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000);
      await user.save();
      throw new Error(`Account temporarily locked. Try again in ${LOCKOUT_MINUTES} minutes`);
    }
    await user.save();
    throw new Error('Invalid email or password');
  }

  user.failed_login_attempts = 0;
  user.lockout_until = null;
  await user.save();

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const redirectUrl = user.role === 'admin' ? '/admin/profile' : '/user/profile';

  const userObj = user.toObject();
  const userData = {
    id: userObj._id,
    fullName: userObj.full_name,
    email: userObj.email,
    phone: userObj.phone || null,
    role: userObj.role,
    studentId: userObj.student_id || null,
    faculty: userObj.faculty || null,
    avatarUrl: userObj.avatar_url || null,
    status: userObj.status,
    coinBalance: userObj.coin_balance,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };

  return { token, user: userData, redirectUrl };
};

/**
 * Send OTP for Registration
 */
const sendRegistrationOTP = async (emailInput) => {
  const email = emailInput.trim().toLowerCase();
  const userExists = await User.findOne({ email });
  if (userExists && userExists.status === 'active') {
    const error = new Error('This email is already registered and active. Please login.');
    error.statusCode = 422;
    throw error;
  }

  const otpCode = generateOTP();
  const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({
    email,
    otp_code: otpCode,
    otp_type: 'register',
    expired_at: expiredAt
  });

  const message = `Your OTP code is: ${otpCode}. Valid for 5 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #007bff; text-align: center;">Verify Your UTEShop Registration</h2>
      <p>Hi there,</p>
      <p>Thank you for registering with UTEShop. Here is your OTP code:</p>
      <div style="font-size: 24px; font-weight: bold; color: #333; text-align: center; padding: 15px; background: #f4f4f4; border-radius: 5px; letter-spacing: 5px;">
        ${otpCode}
      </div>
      <p style="color: #666; font-size: 14px; text-align: center;">This code will expire in 5 minutes.</p>
      <hr>
      <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this code, please ignore this email.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject: '[UTEShop] Registration Verification OTP',
    message,
    html
  });

  return true;
};

/**
 * Verify OTP and Create User
 */
const registerUser = async (userData) => {
  let { full_name, email, password, otp_code } = userData;
  email = email.trim().toLowerCase();

  console.log(`[Register] Attempting for ${email} with OTP ${otp_code}`);

  const otpRecord = await OTP.findOne({
    email,
    otp_code,
    otp_type: 'register',
    is_verified: false
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    console.log(`[Register] OTP not found or already verified for ${email}`);
    const error = new Error('Invalid OTP code or already verified');
    error.statusCode = 422;
    throw error;
  }

  if (new Date() > otpRecord.expired_at) {
    console.log(`[Register] OTP expired for ${email}. Expired at: ${otpRecord.expired_at}`);
    const error = new Error('OTP code has expired');
    error.statusCode = 422;
    throw error;
  }

  const userExists = await User.findOne({ email });
  if (userExists && userExists.status === 'active') {
    const error = new Error('Email is already registered');
    error.statusCode = 422;
    throw error;
  }

  otpRecord.is_verified = true;
  await otpRecord.save();

  const hashedPassword = await hashPassword(password);

  let student_id = '';
  const domain = email.split('@')[1];
  if (domain === 'student.hcmute.edu.vn') {
    student_id = email.split('@')[0];
  }

  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    student_id,
    role: 'customer',
    status: 'active',
    email_verified_at: new Date(),
    coin_balance: 0
  });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  return { user, token };
};

module.exports = {
  generateOTP,
  hashPassword,
  verifyOTP,
  sendOTPEmail,
  authenticate,
  sendRegistrationOTP,
  registerUser
};
