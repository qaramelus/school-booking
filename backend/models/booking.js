const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cancellationSchema = new Schema({
  date: { type: Date, required: true },
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
  activityId: { type: Schema.Types.ObjectId, ref: 'Activity' }, 
  dateBooked: { type: Date, default: Date.now }, 
  timeSlots: [bookedTimeSlotSchema],
  cancellations: [cancellationSchema] 
});

module.exports = mongoose.model('Booking', bookingSchema);
