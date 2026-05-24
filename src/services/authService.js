const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OTP = require('../models/OTP');
const User = require('../models/User');
const sendEmail = require('../utils/mail');
const { getOTPTemplate, getAlertTemplate } = require('../utils/emailTemplates');
const UserRole = require('../models/UserRole');
const Role = require('../models/Role');

const getUserRole = async (userId, fallbackRole = 'customer') => {
  try {
    const userRole = await UserRole.findOne({ user_id: userId }).populate('role_id');
    if (userRole && userRole.role_id && userRole.role_id.name) {
      return userRole.role_id.name.toLowerCase(); // 'admin', 'manager', 'seller', 'customer'
    }
  } catch (err) {
    console.error('Error fetching UserRole:', err);
  }
  return fallbackRole;
};

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
 * Send Login Alert Email
 */
const sendLoginAlertEmail = (user, ipAddress, deviceInfo) => {
  if (user.security_alerts?.login_alerts !== false) {
    const parseUA = (userAgent) => {
      if (!userAgent) return 'Unknown Device';
      let os = 'Unknown OS';
      let browser = 'Unknown Browser';
      
      if (userAgent.includes('Windows')) os = 'Windows';
      else if (userAgent.includes('Macintosh') || userAgent.includes('Mac OS')) os = 'macOS';
      else if (userAgent.includes('iPhone')) os = 'iPhone';
      else if (userAgent.includes('iPad')) os = 'iPad';
      else if (userAgent.includes('Android')) os = 'Android';
      else if (userAgent.includes('Linux')) os = 'Linux';
      
      if (userAgent.includes('Edg/')) browser = 'Edge';
      else if (userAgent.includes('Chrome') && !userAgent.includes('Edg/')) browser = 'Chrome';
      else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
      else if (userAgent.includes('Firefox')) browser = 'Firefox';
      else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) browser = 'Opera';
      
      return `${browser} on ${os}`;
    };

    const device = parseUA(deviceInfo);
    const time = new Date().toLocaleString('en-US');
    const message = `Hello ${user.full_name},\n\nYour UTEShop account was successfully logged in from a new device/location.\nTime: ${time}\nDevice: ${device}\nIP Address: ${ipAddress}\n\nBest regards,\nUTEShop Support Team`;
    const html = getAlertTemplate(
      'New Login Detected',
      `Hello ${user.full_name}, we detected a login to your account from a new device or location.`,
      [
        { label: 'Time', value: time },
        { label: 'Device', value: device },
        { label: 'IP Address', value: ipAddress }
      ],
      'red',
      true
    );

    sendEmail({
      email: user.email,
      subject: '[UTEShop] Security Alert: New Login Detected',
      message,
      html
    }).catch(err => console.error('Failed to send login alert email:', err));
  }
};

/**
 * Send OTP via Email (for Forgot Password)
 */
const sendOTPEmail = async (email, otpCode) => {
  try {
    const message = `Your password reset OTP code is: ${otpCode}. It is valid for 10 minutes.`;
    const html = getOTPTemplate(
      'Password Reset Request',
      'We received a request to reset your password for your UTEShop account. Please use the verification code below to reset your password.',
      otpCode,
      10,
      'If you did not request a password reset, please safely ignore this email.',
      'red'
    );

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
const authenticate = async (email, password, ipAddress, deviceInfo) => {
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

  // Kiểm tra 2FA
  if (user.two_factor_enabled) {
    const otpCode = generateOTP();
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await OTP.create({
      email: user.email,
      otp_code: otpCode,
      otp_type: '2fa',
      expired_at: expiredAt
    });

    const message = `Your UTEShop 2FA verification code is: ${otpCode}. Valid for 5 minutes.`;
    const html = getOTPTemplate(
      'Two-Factor Auth Verification',
      'A login request was detected for your account. Please use the verification code below to proceed with two-factor authentication.',
      otpCode,
      5,
      'If you did not make this request, please ignore this email.',
      'red'
    );

    await sendEmail({
      email: user.email,
      subject: '[UTEShop] 2FA Verification Code',
      message,
      html
    });

    return { require2Fa: true, email: user.email };
  }

  const roleName = await getUserRole(user._id, user.role || 'customer');

  const token = jwt.sign(
    { id: user._id, role: roleName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );



  const roleRedirects = { admin: '/admin/', manager: '/manager/', seller: '/seller/', vendor: '/seller/', customer: '/' };
  const redirectUrl = roleRedirects[roleName] || '/';

  const userObj = user.toObject();
  const userData = {
    id: userObj._id,
    full_name: userObj.full_name,
    email: userObj.email,
    phone: userObj.phone || null,
    dob: userObj.dob || null,
    gender: userObj.gender || null,
    role: roleName,
    avatar_url: userObj.avatar_url || null,
    status: userObj.status,
    coin_balance: userObj.coin_balance,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };

  sendLoginAlertEmail(user, ipAddress, deviceInfo);

  return { token, user: userData, redirectUrl };
};

/**
 * Verify 2FA code and log in
 */
const verify2FA = async (email, otpCode, ipAddress, deviceInfo) => {
  const isOtpValid = await verifyOTP(email, otpCode, '2fa');
  if (!isOtpValid) {
    throw new Error('Invalid or expired 2FA verification code');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  const roleName = await getUserRole(user._id, user.role || 'customer');

  const token = jwt.sign(
    { id: user._id, role: roleName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );



  const roleRedirects = { admin: '/admin/', manager: '/manager/', seller: '/seller/', vendor: '/seller/', customer: '/' };
  const redirectUrl = roleRedirects[roleName] || '/';

  const userObj = user.toObject();
  const userData = {
    id: userObj._id,
    full_name: userObj.full_name,
    email: userObj.email,
    phone: userObj.phone || null,
    dob: userObj.dob || null,
    gender: userObj.gender || null,
    role: roleName,
    avatar_url: userObj.avatar_url || null,
    status: userObj.status,
    coin_balance: userObj.coin_balance,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt
  };

  sendLoginAlertEmail(user, ipAddress, deviceInfo);

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
  const html = getOTPTemplate(
    'Verify Your Registration',
    'Thank you for registering with UTEShop. Please use the verification code below to complete your registration.',
    otpCode,
    5,
    'If you did not request this code, please ignore this email.',
    'green'
  );

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

  const roleName = 'customer';
  const token = jwt.sign(
    { id: user._id, role: roleName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const userObj = user.toObject();
  userObj.role = roleName;

  return { user: userObj, token };
};

/**
 * Social Authenticate (Google/Facebook)
 */
const socialAuthenticate = async (userData, ipAddress, deviceInfo) => {
  const { email, full_name, avatar_url, provider, provider_id } = userData;

  let user = await User.findOne({ email });

  if (user) {
    // Update avatar if the user doesn't have one yet
    if (!user.avatar_url && avatar_url) {
      user.avatar_url = avatar_url;
      await user.save();
    }
  } else {
    // Create new user
    user = await User.create({
      full_name,
      email,
      password: await hashPassword(Math.random().toString(36).slice(-10)), // Random password
      avatar_url,
      role: 'customer',
      status: 'active',
      email_verified_at: new Date(),
    });
  }

  const roleName = await getUserRole(user._id, 'customer');
  const token = jwt.sign(
    { id: user._id, role: roleName },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );



  const userObj = user.toObject();
  const returnUserData = {
    id: userObj._id,
    full_name: userObj.full_name,
    email: userObj.email,
    avatar_url: userObj.avatar_url,
    phone: userObj.phone || null,
    dob: userObj.dob || null,
    gender: userObj.gender || null,
    role: roleName,
    status: userObj.status,
    createdAt: userObj.createdAt,
  };

  sendLoginAlertEmail(user, ipAddress, deviceInfo);

  return { token, user: returnUserData };
};

module.exports = {
  generateOTP,
  hashPassword,
  verifyOTP,
  sendOTPEmail,
  authenticate,
  sendRegistrationOTP,
  registerUser,
  socialAuthenticate,
  verify2FA
};
