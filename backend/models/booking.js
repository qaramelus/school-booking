const mongoose = require('mongoose');

const bookedTimeSlotSchema = new mongoose.Schema({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true }, 
  endTime: { type: String, required: true }, 
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: 'Child' }, 
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }, 
  dateBooked: { type: Date, default: Date.now }, 
  timeSlots: [bookedTimeSlotSchema], 
});

module.exports = mongoose.model('Booking', bookingSchema);
