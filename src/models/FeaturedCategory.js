const mongoose = require('mongoose');

const featuredCategorySchema = new mongoose.Schema({
     section_id: { type: mongoose.Schema.Types.ObjectId, ref: 'HomepageSection', required: true },
     category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
     sort_order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('FeaturedCategory', featuredCategorySchema);
