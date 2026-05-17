const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., "PRODUCT_APPROVE"
  module: { type: String } // e.g., "Product"
}, { timestamps: true });

module.exports = mongoose.model('Permission', permissionSchema);
