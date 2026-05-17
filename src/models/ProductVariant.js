const mongoose = require('mongoose');

const productVariantSchema = new mongoose.Schema({
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     attributes: { type: mongoose.Schema.Types.Mixed, required: true },
     additional_price: { type: Number, default: 0 },
     stock_quantity: { type: Number, default: 0 },
     sku: { type: String, unique: true, sparse: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductVariant', productVariantSchema);
