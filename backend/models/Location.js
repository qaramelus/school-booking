// Location.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const locationSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  // You can add more fields like coordinates, contact information, etc. if needed
});

module.exports = mongoose.model('Location', locationSchema);
