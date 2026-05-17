const mongoose = require('mongoose');

const campaignTargetSchema = new mongoose.Schema({
     campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
     product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
     target_type: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('CampaignTarget', campaignTargetSchema);
