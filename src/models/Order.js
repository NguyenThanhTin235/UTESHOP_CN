const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_code: { type: String, required: true, unique: true },
  payment_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentOrder', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'disputed', 'refunded', 'cancel_pending'],
    default: 'pending'
  },
  subtotal_amount: { type: Number, required: true },
  shipping_fee: { type: Number, default: 0 },
  coupon_discount: { type: Number, default: 0 },
  coin_discount: { type: Number, default: 0 },
  platform_fee_rate: { type: Number },
  platform_fee_amount: { type: Number },
  total_final: { type: Number, required: true },
  payment_status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  coin_earned: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
