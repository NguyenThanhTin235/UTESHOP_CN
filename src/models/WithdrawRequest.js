const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema({
     shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
     amount: { type: Number, required: true },
     status: { type: String, enum: ['pending', 'approved', 'rejected', 'paid'], default: 'pending' },
     approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     approved_at: { type: Date },
     note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
