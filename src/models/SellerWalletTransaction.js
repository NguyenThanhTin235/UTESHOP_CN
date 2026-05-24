const mongoose = require('mongoose');

const sellerWalletTransactionSchema = new mongoose.Schema({
     shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
     type: { type: String, enum: ['earning', 'fee', 'refund', 'adjust', 'withdraw'], required: true },
     amount: { type: Number, required: true },
     balance_before: { type: Number, required: true },
     balance_after: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SellerWalletTransaction', sellerWalletTransactionSchema);
