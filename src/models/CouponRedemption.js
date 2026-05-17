const mongoose = require('mongoose');

const couponRedemptionSchema = new mongoose.Schema({
     coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true },
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     used_at: { type: Date, default: Date.now }
}, { timestamps: true });

couponRedemptionSchema.index({ coupon_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('CouponRedemption', couponRedemptionSchema);
