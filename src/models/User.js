const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Nhà riêng' },
  recipient_name: { type: String, required: true },
  recipient_phone: { type: String, required: true },
  street_address: { type: String, required: true },
  city: { type: String, default: 'TP.HCM' },
  is_default: { type: Boolean, default: false }
});

const shipperProfileSchema = new mongoose.Schema({
  vehicle_type: { type: String },
  license_plate: { type: String },
  driver_license: { type: String },
  is_available: { type: Boolean, default: true }
});

const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'vendor', 'customer', 'shipper'], 
    required: true,
    default: 'customer'
  },
  student_id: { type: String },
  faculty: { type: String },
  avatar_url: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'active', 'locked', 'inactive'], 
    default: 'active' 
  },
  failed_login_attempts: { type: Number, default: 0 },
  lockout_until: { type: Date },
  email_verified_at: { type: Date },
  coin_balance: { type: Number, default: 0 },
  addresses: [addressSchema],
  shipper_details: shipperProfileSchema, // Nhúng thông tin Shipper
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }] // Danh sách yêu thích
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
