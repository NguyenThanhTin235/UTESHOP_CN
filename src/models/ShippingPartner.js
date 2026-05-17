const mongoose = require('mongoose');

const shippingPartnerSchema = new mongoose.Schema({
     name: { type: String, required: true },
     code: { type: String, required: true, unique: true },
     is_active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ShippingPartner', shippingPartnerSchema);
