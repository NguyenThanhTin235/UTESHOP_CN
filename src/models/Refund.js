const mongoose = require('mongoose');

const refundSchema = new mongoose.Schema({
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     return_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ReturnRequest', required: true },
     refund_cash_amount: { type: Number, default: 0 },
     refund_coin_amount: { type: Number, default: 0 },
     total_refund_amount: { type: Number, required: true },
     status: { type: String, enum: ['pending', 'success', 'failed'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Refund', refundSchema);
