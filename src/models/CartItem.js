const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
     cart_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     variant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant' },
     quantity: { type: Number, required: true, min: 1 },
     note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CartItem', cartItemSchema);
