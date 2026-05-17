const mongoose = require('mongoose');

const shippingReviewSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     shipping_partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingPartner', required: true },
     rating: { type: Number, min: 1, max: 5, required: true },
     comment: { type: String }
}, { timestamps: true });

shippingReviewSchema.index({ order_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('ShippingReview', shippingReviewSchema);
