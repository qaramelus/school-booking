const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  dateBooked: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);
