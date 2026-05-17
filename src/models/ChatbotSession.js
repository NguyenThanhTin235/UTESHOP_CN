const mongoose = require('mongoose');

const chatbotSessionSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     session_token: { type: String, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('ChatbotSession', chatbotSessionSchema);
