const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  phone: { type: String },
  logo_url: { type: String },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Shop', shopSchema);
