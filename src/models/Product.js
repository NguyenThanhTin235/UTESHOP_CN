const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  variant_name: { type: String }, // VD: Size, Màu sắc
  variant_value: { type: String }, // VD: XL, Đỏ
  additional_price: { type: Number, default: 0 },
  stock_quantity: { type: Number, default: 0 },
  sku: { type: String, unique: true, sparse: true }
});

const mediaSchema = new mongoose.Schema({
  media_type: { type: String, enum: ['image', 'video'], required: true },
  media_url: { type: String, required: true },
  sort_order: { type: Number, default: 0 }
});

const productSchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  base_price: { type: Number, required: true },
  sku: { type: String, unique: true },
  is_active: { type: Boolean, default: true },
  average_rating: { type: Number, default: 0 },
  variants: [variantSchema],
  media: [mediaSchema]
}, {
  timestamps: true
});

// Index để tìm kiếm nhanh sản phẩm theo tên và slug
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
