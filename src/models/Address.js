const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     label: { type: String },
     recipient_name: { type: String, required: true },
     recipient_phone: { type: String, required: true },
     street_address: { type: String, required: true },
     city: { type: String },
     is_default: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
