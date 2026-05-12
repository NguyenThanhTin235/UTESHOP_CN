const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant_id: { type: mongoose.Schema.Types.ObjectId }, // ID của variant cụ thể
  quantity: { type: Number, required: true, min: 1 },
  price_at_buy: { type: Number, required: true } // Lưu giá tại thời điểm mua để tránh thay đổi sau này
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String },
  updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  created_at: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  order_code: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shipper: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigned_at: { type: Date },
  coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled', 'refunded'],
    default: 'pending' 
  },
  total_base: { type: Number, required: true },
  shipping_fee: { type: Number, default: 0 },
  discount_total: { type: Number, default: 0 },
  total_final: { type: Number, required: true },
  payment_status: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  coin_spent: { type: Number, default: 0 },
  coin_earned: { type: Number, default: 0 },
  items: [orderItemSchema],
  history: [statusHistorySchema],
  cancellation: {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String },
    cancelled_at: { type: Date }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
