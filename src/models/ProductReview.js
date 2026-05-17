const mongoose = require('mongoose');

const productReviewSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     order_item_id: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderItem' },
     rating: { type: Number, min: 1, max: 5, required: true },
     comment: { type: String }
}, { timestamps: true });

// productReviewSchema.index({ order_item_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ProductReview', productReviewSchema);
