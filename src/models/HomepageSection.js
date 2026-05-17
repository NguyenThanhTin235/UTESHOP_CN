const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema({
     title: { type: String },
     type: { type: String },
     sort_order: { type: Number, default: 0 },
     is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('HomepageSection', homepageSectionSchema);
