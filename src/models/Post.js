const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
     title: { type: String, required: true },
     slug: { type: String, required: true, unique: true },
     content: { type: String },
     author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     status: { type: String, enum: ['draft', 'published'], default: 'draft' }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
