const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp_code: { type: String, required: true },
  otp_type: { type: String, enum: ['register', 'login', 'reset_password', '2fa'], required: true },
  expired_at: { type: Date, required: true },
  is_verified: { type: Boolean, default: false }
}, { timestamps: true });

// Thiết lập TTL (Time To Live) để tự động xóa mã hết hạn
otpSchema.index({ expired_at: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
