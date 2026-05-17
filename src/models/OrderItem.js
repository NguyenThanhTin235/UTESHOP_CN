const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
     quantity: { type: Number, required: true, min: 1 },
     price_at_buy: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('OrderItem', orderItemSchema);
