const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
     return_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ReturnRequest', required: true },
     status: { type: String, enum: ['open', 'resolved', 'rejected'], required: true },
     resolved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
     resolution_note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
