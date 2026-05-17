const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
     conversation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
     sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     message_type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
     content: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
