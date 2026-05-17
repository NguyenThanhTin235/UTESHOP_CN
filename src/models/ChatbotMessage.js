const mongoose = require('mongoose');

const chatbotMessageSchema = new mongoose.Schema({
     session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatbotSession', required: true },
     sender: { type: String, enum: ['user', 'bot'], required: true },
     content: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ChatbotMessage', chatbotMessageSchema);
