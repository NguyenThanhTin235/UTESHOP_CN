const mongoose = require('mongoose');

const productMediaSchema = new mongoose.Schema({
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     media_type: { type: String, enum: ['image', 'video'], required: true },
     media_url: { type: String, required: true },
     sort_order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ProductMedia', productMediaSchema);
