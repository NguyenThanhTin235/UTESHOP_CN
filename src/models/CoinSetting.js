const mongoose = require('mongoose');

const coinSettingSchema = new mongoose.Schema({
     earn_rate: { type: Number, required: true },
     spend_rate: { type: Number, required: true },
     max_usage_percent: { type: Number, required: true },
     effective_from: { type: Date, required: true },
     effective_to: { type: Date },
     created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CoinSetting', coinSettingSchema);
