const mongoose = require('mongoose');

const platformFeeSettingSchema = new mongoose.Schema({
     fee_percent: { type: Number, required: true },
     effective_from: { type: Date, required: true },
     effective_to: { type: Date },
     created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('PlatformFeeSetting', platformFeeSettingSchema);
