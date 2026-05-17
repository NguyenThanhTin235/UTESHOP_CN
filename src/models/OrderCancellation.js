const mongoose = require('mongoose');

const orderCancellationSchema = new mongoose.Schema({
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     reason: { type: String, required: true },
     cancelled_at: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('OrderCancellation', orderCancellationSchema);
