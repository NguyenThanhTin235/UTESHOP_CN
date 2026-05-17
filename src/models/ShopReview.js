const mongoose = require('mongoose');

const shopReviewSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
     rating: { type: Number, min: 1, max: 5, required: true },
     comment: { type: String }
}, { timestamps: true });

shopReviewSchema.index({ order_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ShopReview', shopReviewSchema);
