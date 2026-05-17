const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
     payment_order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentOrder', required: true },
     payment_method: { type: String, enum: ['vnpay', 'momo', 'cod'], required: true },
     transaction_id: { type: String },
     amount: { type: Number, required: true },
     status: { type: String, enum: ['success', 'failed', 'pending'], required: true },
     payment_date: { type: Date },
     response_data: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
