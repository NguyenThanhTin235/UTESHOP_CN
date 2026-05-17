const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: { type: String, required: true, unique: true },
  address: { type: String },
  phone: { type: String },
  logo_url: { type: String },
  banner_url: { type: String },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  description: { type: String },
  rating: { type: Number, default: 0 },
  followers: { type: Number, default: 0 },
  response_rate: { type: Number, default: 0 }, // Percentage
  joined_at: { type: Date, default: Date.now },
  response_time: { type: String, default: 'within hours' }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
