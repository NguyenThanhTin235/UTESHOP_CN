const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
     order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
     shipping_partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ShippingPartner', required: true },
     tracking_code: { type: String },
     status: { type: String, enum: ['created', 'picked', 'in_transit', 'delivered', 'failed'], required: true },
     label_url: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
