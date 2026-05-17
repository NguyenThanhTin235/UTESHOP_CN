const mongoose = require('mongoose');

const sellerWalletSchema = new mongoose.Schema({
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, unique: true },
  total_balance: { type: Number, default: 0 },
  pending_balance: { type: Number, default: 0 },
  available_balance: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SellerWallet', sellerWalletSchema);
