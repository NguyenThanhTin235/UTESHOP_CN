const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  description: { type: String },
  banner_url: { type: String },
  view_count: { type: Number, default: 0 },
  start_at: { type: Date, required: true },
  end_at: { type: Date, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  type: { type: String }, // VD: Khuyến mãi mùa hè, Black Friday...
  value: { type: Number } // Giá trị giảm giá chung nếu có
}, { timestamps: true });

module.exports = mongoose.model('Campaign', campaignSchema);
