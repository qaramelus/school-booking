const mongoose = require('mongoose');

const bookedTimeSlotSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }, 
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' }, // Reference to the Child model
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }, // Reference to the Activity model
  dateBooked: { type: Date, default: Date.now }, // The date when this booking was made
  timeSlots: [bookedTimeSlotSchema], // Array of booked time slots
});

module.exports = mongoose.model('Booking', bookingSchema);
