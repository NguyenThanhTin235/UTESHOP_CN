const mongoose = require('mongoose');

const refundTransactionSchema = new mongoose.Schema({
     refund_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Refund', required: true },
     payment_gateway: { type: String },
     transaction_id: { type: String },
     response_data: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('RefundTransaction', refundTransactionSchema);
