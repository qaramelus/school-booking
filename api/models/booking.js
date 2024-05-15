// Booking.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cancellationSchema = new Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  reason: { type: String }
}, { _id: false });

const bookedTimeSlotSchema = new Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
}, { _id: false });

const bookingSchema = new Schema({
  childId: { type: Schema.Types.ObjectId, ref: 'User' },
  activityId: { type: Schema.Types.ObjectId, ref: 'Activity' }, // Ensure this references 'Activity'
  dateBooked: { type: Date, default: Date.now },
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }], 
  status: { type: String, enum: ['confirmed', 'waitlisted'], default: 'confirmed' }
});

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

