const mongoose = require('mongoose');

const productReviewMediaSchema = new mongoose.Schema({
     product_review_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductReview', required: true },
     media_type: { type: String, enum: ['image', 'video'], required: true },
     media_url: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ProductReviewMedia', productReviewMediaSchema);
