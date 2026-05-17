const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
     order_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem', required: true },
     customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     status: { type: String, enum: ['requested', 'accepted', 'rejected', 'received', 'refunded'], required: true },
     reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema);
