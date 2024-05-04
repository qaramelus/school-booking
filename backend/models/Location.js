// Location.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  capacity: { type: Number, required: true }  // Adding capacity field
});

module.exports = mongoose.model('Location', locationSchema);
