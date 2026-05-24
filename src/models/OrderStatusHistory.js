const mongoose = require('mongoose');

const orderStatusHistorySchema = new mongoose.Schema({
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     status: {
          type: String,
          enum: ['pending', 'confirmed', 'shipped', 'delivered', 'canceled', 'disputed', 'refunded', 'cancel_pending'],
          required: true
     },
     note: { type: String },
     updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
