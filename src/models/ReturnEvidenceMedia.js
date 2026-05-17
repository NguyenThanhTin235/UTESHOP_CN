const mongoose = require('mongoose');

const returnEvidenceMediaSchema = new mongoose.Schema({
     return_request_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ReturnRequest', required: true },
     media_type: { type: String, enum: ['image', 'video'], required: true },
     media_url: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ReturnEvidenceMedia', returnEvidenceMediaSchema);
