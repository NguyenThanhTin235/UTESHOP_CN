const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  mrp_price: { type: Number, required: true },
  selling_price: { type: Number, required: true },
  sku: { type: String, unique: true, sparse: true },
  approval_status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  is_active: { type: Boolean, default: true },
  view_count: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh sản phẩm theo tên và slug
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
