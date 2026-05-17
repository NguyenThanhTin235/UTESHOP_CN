const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
     actor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     action: { type: String, required: true },
     entity_type: { type: String, required: true },
     entity_id: { type: mongoose.Schema.Types.ObjectId },
     metadata: { type: Object }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
