const mongoose = require('mongoose');

const productApprovalSchema = new mongoose.Schema({
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     approver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
     action: { type: String, enum: ['approved', 'rejected'], required: true },
     reason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ProductApproval', productApprovalSchema);
