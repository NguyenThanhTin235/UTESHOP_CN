const mongoose = require('mongoose');

const paymentOrderSchema = new mongoose.Schema({
     payment_code: { type: String, required: true, unique: true },
     customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
     coin_spent_total: { type: Number, default: 0 },
     subtotal_amount: { type: Number, required: true },
     discount_amount: { type: Number, default: 0 },
     shipping_amount: { type: Number, default: 0 },
     final_amount: { type: Number, required: true },
     payment_method: { type: String, enum: ['vnpay', 'momo', 'cod'] },
     payment_status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
     transaction_id: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('PaymentOrder', paymentOrderSchema);
