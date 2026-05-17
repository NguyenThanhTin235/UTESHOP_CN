const mongoose = require('mongoose');

const shipmentEventSchema = new mongoose.Schema({
     shipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
     status: { type: String },
     location: { type: String },
     event_time: { type: Date },
     raw_payload: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('ShipmentEvent', shipmentEventSchema);
