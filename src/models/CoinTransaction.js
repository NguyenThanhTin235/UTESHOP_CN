const mongoose = require('mongoose');

const coinTransactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: { type: Number, required: true }, // Số xu thay đổi (VD: -50, +10)
  type: { type: String, enum: ['earn', 'spend', 'refund'], required: true },
  description: { type: String },
  balance_before: { type: Number, required: true },
  balance_after: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CoinTransaction', coinTransactionSchema);
