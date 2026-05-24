const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  avatar_url: { type: String },
  status: {
    type: String,
    enum: ['pending', 'active', 'locked', 'inactive'],
    default: 'pending'
  },
  failed_login_attempts: { type: Number, default: 0 },
  lockout_until: { type: Date },
  email_verified_at: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dob: { type: Date },
  coin_balance: { type: Number, default: 0 },
  two_factor_enabled: { type: Boolean, default: false },
  security_alerts: {
    login_alerts: { type: Boolean, default: true },
    password_changes: { type: Boolean, default: true }
  }

}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
