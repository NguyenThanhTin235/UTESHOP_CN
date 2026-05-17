const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // ADMIN, MANAGER, SELLER, CUSTOMER
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
