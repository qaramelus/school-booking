// Sessions.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  activityId: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  originalSessionId: { type: Schema.Types.ObjectId, ref: 'Booking' }, // Reference to the original Booking for tracking purposes
  newStartTime: { type: String }, // Updated start time if session is rescheduled
  newEndTime: { type: String }, // Updated end time if session is rescheduled
  cancellationReason: { type: String }, // Reason for cancellation, if applicable
  cancelled: { type: Boolean, default: false }, // Indicates if session is cancelled
  rescheduled: { type: Boolean, default: false } // Indicates if session is rescheduled
});

module.exports = mongoose.model('Session', sessionSchema);
