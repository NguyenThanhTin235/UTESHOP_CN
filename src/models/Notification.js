const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  detailContent: { type: String },
  category: { type: String, default: 'System' },
  type: { type: String, enum: ['order', 'promotion', 'system'], default: 'system' },
  is_read: { type: Boolean, default: false },
  date: { type: String },
  orderSummary: {
    name: String,
    qty: Number,
    variant: String,
    image: String
  },
  link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
